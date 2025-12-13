/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// ============================================================================
// GOOGLE SHEETS SYNC FUNCTION
// ============================================================================
// This function syncs pledges and orders to Google Sheets via Google Apps Script
// To set up:
// 1. Create a Google Sheet
// 2. Create Apps Script to receive data: https://script.google.com
// 3. Get the deployment URL
// 4. Set GOOGLE_SHEETS_WEBHOOK_URL as environment variable

const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || 
    'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercopy?state=CODE';

// Sync pledges to Google Sheets
exports.syncPledgeToSheets = onDocumentCreated(
    "pledges/{pledgeId}",
    async (event) => {
        const pledgeData = event.data.data();
        const pledgeId = event.params.pledgeId;

        try {
            const payload = {
                type: 'pledge',
                id: pledgeId,
                firstName: pledgeData.firstName || '',
                lastName: pledgeData.lastName || '',
                fullName: pledgeData.fullName || '',
                email: pledgeData.email || '',
                phone: pledgeData.phone || '',
                birthday: pledgeData.birthday || '',
                timestamp: pledgeData.timestamp ? 
                    new Date(pledgeData.timestamp.seconds * 1000).toISOString() : 
                    new Date().toISOString()
            };

            // Send to Google Sheets via webhook
            const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                timeout: 5000
            });

            if (!response.ok) {
                logger.warn('Google Sheets sync warning:', {
                    pledgeId,
                    status: response.status,
                    statusText: response.statusText
                });
                // Don't fail the function - Firestore is source of truth
            } else {
                logger.info('Pledge synced to Google Sheets:', { pledgeId });
            }
        } catch (error) {
            logger.warn('Error syncing pledge to Google Sheets:', {
                pledgeId,
                error: error.message
            });
            // Don't fail the function - Firestore is source of truth
        }
    }
);

// Sync orders to Google Sheets
exports.syncOrderToSheets = onDocumentCreated(
    "orders/{orderId}",
    async (event) => {
        const orderData = event.data.data();
        const orderId = event.params.orderId;

        try {
            const payload = {
                type: 'order',
                id: orderId,
                orderId: orderData.orderId || '',
                customerName: orderData.customer?.firstName + ' ' + orderData.customer?.lastName || '',
                customerEmail: orderData.customer?.email || '',
                customerPhone: orderData.customer?.phone || '',
                items: (orderData.items || []).map(i => i.name).join(', '),
                subtotal: orderData.pricing?.subtotal || 0,
                tax: orderData.pricing?.tax || 0,
                total: orderData.pricing?.total || 0,
                paymentMethod: orderData.payment?.method || '',
                paymentStatus: orderData.payment?.status || '',
                orderStatus: orderData.status || '',
                timestamp: orderData.timestamp ? 
                    new Date(orderData.timestamp.seconds * 1000).toISOString() : 
                    new Date().toISOString()
            };

            // Send to Google Sheets via webhook
            const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                timeout: 5000
            });

            if (!response.ok) {
                logger.warn('Google Sheets sync warning:', {
                    orderId,
                    status: response.status,
                    statusText: response.statusText
                });
                // Don't fail the function - Firestore is source of truth
            } else {
                logger.info('Order synced to Google Sheets:', { orderId });
            }
        } catch (error) {
            logger.warn('Error syncing order to Google Sheets:', {
                orderId,
                error: error.message
            });
            // Don't fail the function - Firestore is source of truth
        }
    }
);

// ============================================================================
// EMAIL NOTIFICATION FUNCTION (Fallback if extension not installed)
// ============================================================================
exports.sendOrderNotification = onDocumentCreated(
    "orders/{orderId}",
    async (event) => {
        const orderData = event.data.data();
        const orderId = event.params.orderId;

        try {
            // Only process if email was not already sent by extension
            if (!orderData.emailSent) {
                // Add to mail queue for Trigger Email extension
                const db = admin.firestore();
                await db.collection('mail').add({
                    to: ['rechargearthorganization@gmail.com'],
                    message: {
                        subject: `🌱 New Order #${orderData.orderId}`,
                        html: generateOrderEmailHTML(orderData)
                    },
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });

                // Send customer confirmation
                await db.collection('mail').add({
                    to: [orderData.customer?.email],
                    message: {
                        subject: `Order Confirmation #${orderData.orderId} - RechargEarth`,
                        html: generateCustomerEmailHTML(orderData)
                    },
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });

                logger.info('Email notifications sent for order:', { orderId });
            }
        } catch (error) {
            logger.warn('Error sending order notification:', {
                orderId,
                error: error.message
            });
        }
    }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateOrderEmailHTML(order) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #064e3b; color: white; padding: 20px; text-align: center; }
                .content { background: #f9f9f9; padding: 20px; }
                .order-item { border-bottom: 1px solid #ddd; padding: 10px 0; }
                .total { font-size: 18px; font-weight: bold; color: #064e3b; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 8px; }
                .label { font-weight: bold; width: 150px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌱 New Order Received</h1>
                </div>
                <div class="content">
                    <h2>Order #${order.orderId}</h2>
                    <p><strong>Date:</strong> ${new Date(order.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                    <h3>Customer Information</h3>
                    <table>
                        <tr><td class="label">Name:</td><td>${order.customer?.firstName} ${order.customer?.lastName}</td></tr>
                        <tr><td class="label">Email:</td><td>${order.customer?.email}</td></tr>
                        <tr><td class="label">Phone:</td><td>${order.customer?.phone}</td></tr>
                    </table>
                    <h3>Order Summary</h3>
                    <table>
                        <tr><td class="label">Subtotal:</td><td>₹${order.pricing?.subtotal || 0}</td></tr>
                        <tr><td class="label">Tax:</td><td>₹${order.pricing?.tax || 0}</td></tr>
                        <tr><td class="label">Total:</td><td class="total">₹${order.pricing?.total || 0}</td></tr>
                    </table>
                </div>
            </div>
        </body>
        </html>
    `;
}

function generateCustomerEmailHTML(order) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #064e3b 0%, #10b981 100%); color: white; padding: 30px; text-align: center; }
                .content { background: white; padding: 30px; }
                .total-box { background: #064e3b; color: white; padding: 20px; text-align: center; border-radius: 8px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌱 Thank You for Your Order!</h1>
                </div>
                <div class="content">
                    <p>Hi ${order.customer?.firstName},</p>
                    <p>Your order #${order.orderId} has been confirmed!</p>
                    <div class="total-box">
                        <h3>Total Amount</h3>
                        <h1>₹${order.pricing?.total || 0}</h1>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

