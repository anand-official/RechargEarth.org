# Admin Panel Quick Reference

## Access Admin Panel
1. Click **Admin** button in header (amber color)
2. Or scroll to footer and click the padlock icon
3. You must be logged in as admin

## Tab 1: PLEDGES (Default)

### View All Pledges
- Table shows: Date | Name | Birthday | Contact | Actions
- Real-time updates from Firestore
- Newest pledges at top

### Edit a Pledge
1. Click **✏️ Edit** button on the pledge row
2. Modal appears with editable fields
3. Update: Name, Email, Phone, Birthday
4. Click **Save Changes**
5. Changes appear in table immediately

### Delete a Pledge
1. Click **🗑️ Delete** button on the pledge row
2. Confirm dialog appears
3. Click **OK** to delete
4. Pledge removed from table and Firestore

### Export to Excel
1. Click **Export to Excel** button (green, top right)
2. CSV file downloads with filename: `pledges_YYYY-MM-DD.csv`
3. Open in Excel, Google Sheets, or any spreadsheet app
4. Includes: Date, Name, Email, Phone, Birthday

---

## Tab 2: PRODUCTS

### Left Side: Add New Package

#### Add a New Product
1. Fill in all fields:
   - **Package Name**: e.g., "Family Forest"
   - **Price (₹)**: e.g., 1500
   - **Image URL**: e.g., https://example.com/image.jpg
   - **Description**: e.g., "Plant trees for your family"
2. Click **Add Product** button
3. Product appears in table below
4. Form clears, ready for next product

#### Edit a Product
1. Click **✏️ Edit** button in the products table (right side)
2. Form populates with product details
3. Form title changes to "Edit Package"
4. Button changes to "Update Product"
5. Update any fields
6. Click **Update Product**
7. Changes saved, form resets
8. OR click **Cancel Edit** to discard changes

### Right Side: Active Products Table

#### View All Products
- Table shows: Image | Details | Actions
- Details include: Name, Price, Description
- Real-time updates from Firestore

#### Delete a Product
1. Click **🗑️ Delete** button on product row
2. Confirm dialog: "Are you sure?"
3. Click **OK** to delete
4. Product removed from table and Firestore

#### Product Details Display
```
[Thumbnail]  Family Forest              ✏️ 🗑️
             ₹1500
             Plant trees for your family
```

---

## Button Reference

| Button | Icon | Purpose | Location |
|--------|------|---------|----------|
| **Add Product** | ➕ | Add new product to database | Product Form |
| **Update Product** | 💾 | Save changes to existing product | Product Form (Edit Mode) |
| **Cancel Edit** | ❌ | Stop editing, clear form | Product Form (Edit Mode) |
| **Export to Excel** | 📊 | Download pledges as CSV | Pledges Tab |
| **Edit** (Pledge) | ✏️ | Open pledge editor modal | Pledge Row |
| **Edit** (Product) | ✏️ | Load product into form for editing | Product Row |
| **Delete** | 🗑️ | Delete item after confirmation | Any Row |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate between form fields |
| `Enter` | Submit form (in product form) |
| `Escape` | Close edit modal (pledge) |

---

## Tips & Tricks

### Form Auto-Fill
- Editing detects field format (URL, number, text)
- Image URLs must be valid HTTPS URLs
- Price must be a number greater than 0

### Real-Time Sync
- Changes appear instantly in table
- No page refresh needed
- If using multiple browser windows, changes sync across them

### Error Handling
- All actions have error messages if something goes wrong
- Check browser console (F12) for detailed errors
- Retry operation if network error occurs

### Data Validation
- All fields are required
- Price must be > 0
- Image URL must be valid format
- Email must be valid format

### CSV Export
- Filename includes export date
- Opens in Excel, Google Sheets, or any CSV reader
- Can edit and re-import if needed

---

## Troubleshooting

**Can't see Admin button?**
- You must be logged in as the admin user
- Admin email must be: `admin@rechargearth.com`
- Check your email in account settings

**Form won't submit?**
- Check all required fields are filled
- Price must be greater than 0
- Image URL must start with `https://`
- Check browser console for errors

**Changes not appearing in table?**
- Firestore listener might be slow (usually <1sec)
- Try refreshing the page
- Check internet connection

**Export button not working?**
- Make sure there are pledges to export
- Check browser download settings
- Try a different browser

**Modal won't close?**
- Click "Cancel" button in the modal
- Or click outside the modal
- Try refreshing the page

---

## Best Practices

### Managing Products
✅ Use clear, descriptive names
✅ Use actual product images
✅ Write helpful descriptions
✅ Keep prices reasonable
✅ Organize by product category

### Managing Pledges
✅ Regular exports for backup
✅ Delete duplicate entries
✅ Update contact info as needed
✅ Monitor pledge activity regularly

### Security
✅ Never share admin access
✅ Use strong password
✅ Log out when done
✅ Review changes regularly

---

## Feature Availability

| Feature | Admin | Regular User |
|---------|-------|--------------|
| View Pledges | ✅ | ❌ |
| Edit Pledges | ✅ | ❌ |
| Delete Pledges | ✅ | ❌ |
| Export Pledges | ✅ | ❌ |
| Add Products | ✅ | ❌ |
| Edit Products | ✅ | ❌ |
| Delete Products | ✅ | ❌ |
| View Products | ✅ | ✅ |

---

## Form Validation Rules

### Package Name
- Required
- Text only
- Any length

### Price
- Required
- Must be number
- Must be > 0
- Example: 1500

### Image URL
- Required
- Must be valid URL
- Should be HTTPS
- Example: `https://example.com/image.jpg`

### Description
- Required
- Text and formatting
- Multi-line allowed
- Max 500 characters recommended

### Pledge Name
- Required
- Text only
- Any length

### Pledge Email
- Required
- Must be valid email
- Example: user@example.com

### Pledge Phone
- Optional
- Text or numbers
- Example: +91-XXXXX-XXXXX

### Pledge Birthday
- Optional
- Format: MM/DD/YYYY
- Example: 12/25/1995

---

## Notifications & Feedback

### Toast Messages

**Success (Green)**
- Product Added Successfully ✅
- Product Updated Successfully ✅
- Pledge updated successfully ✅
- Deleted Successfully ✅
- Exported X pledges to Excel ✅

**Error (Red)**
- Error adding product ❌
- Error updating product ❌
- Error deleting ❌
- Unauthorized Action ❌

**Info (Blue)**
- Edit mode enabled... ℹ️
- Loading... ℹ️

---

**Quick Help:** Press F12 in browser to open console for technical details if something goes wrong.

Last Updated: December 13, 2025
