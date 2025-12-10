# Pre-Taste Feedback System

This system allows users to submit feedback through a modal form on the website. Feedback is automatically saved to an Excel file on the server.

## Features

- **Documentation Button**: Scrolls to References section
- **Feedback Button**: Opens a modal form in the Location section
- **Form Validation**: Message field is required; Name and Topic are optional
- **Excel Storage**: All feedback is saved to `feedback.xlsx` with timestamp, name, topic, and message
- **Dark Mode Compatible**: Form and buttons adapt to light/dark theme
- **Confirmation Message**: User sees confirmation after successful submission

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd menu-do
pip install -r requirements.txt
```

### 2. Run the Backend Server

```bash
python backend.py
```

The server will start on `http://localhost:5000`

### 3. Configure Frontend

The frontend (HTML/CSS/JS) sends feedback to `POST /api/feedback`

**Important**: If your website is hosted on a different domain/port, update the fetch URL in `script.js`:

```javascript
const response = await fetch('/api/feedback', {
```

If needed, change to:
```javascript
const response = await fetch('http://localhost:5000/api/feedback', {
```

### 4. Serve the Website

Use a local server to serve `index.html`:

```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js http-server
npx http-server
```

Then visit `http://localhost:8000` in your browser.

## File Structure

```
menu-do/
├── index.html              # Main website (includes feedback form HTML)
├── styles.css              # Styles (includes button and modal styles)
├── script.js               # Frontend logic (includes feedback handling)
├── backend.py              # Flask server for feedback storage
├── requirements.txt        # Python dependencies
├── feedback.xlsx           # Generated Excel file with feedback (auto-created)
└── menu.json               # Menu data
```

## API Endpoints

### POST /api/feedback
Submit feedback

**Request:**
```json
{
  "name": "John Doe",      // Optional
  "topic": "food",         // Optional (values: food, about, other)
  "message": "Great food!"  // Required
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback received and saved successfully"
}
```

### GET /api/feedback/list
Retrieve all feedback (for admin purposes)

**Response:**
```json
{
  "feedback": [
    {
      "timestamp": "2025-01-09 14:30:45",
      "name": "John Doe",
      "topic": "food",
      "message": "Great appetizers!"
    }
  ]
}
```

### GET /api/health
Health check

## Excel File Format

The `feedback.xlsx` file is automatically created with:
- **Column A**: Timestamp (YYYY-MM-DD HH:MM:SS format)
- **Column B**: Name (or "(Not provided)")
- **Column C**: Topic (or "(Not specified)")
- **Column D**: Message

Features:
- Bold header row with Pre-Taste brand color (#B87333)
- Frozen header row for easy scrolling
- Automatic column width adjustment
- Borders and text wrapping for readability

## User Flow

1. User clicks "Feedback" button in Location section
2. Modal form appears
3. User fills out optional Name and Topic, required Message field
4. User clicks "Submit Feedback"
5. Frontend validates message is not empty
6. Form data is sent to backend via POST /api/feedback
7. Backend validates and saves to feedback.xlsx
8. Confirmation message displays for 2 seconds
9. Form resets and modal closes

## Troubleshooting

### "Failed to fetch" error in browser console
- Ensure backend server is running on `http://localhost:5000`
- Check CORS is enabled (it is in `backend.py`)
- Verify the fetch URL in `script.js` is correct

### Excel file not being created
- Check folder permissions
- Ensure `openpyxl` is installed: `pip install openpyxl`

### Modal form not appearing
- Check browser console for JavaScript errors
- Verify `feedback-modal` element exists in HTML
- Check CSS is loaded correctly

## Customization

### Change Server Port
Edit `backend.py`:
```python
app.run(debug=True, port=8080)  # Change 5000 to desired port
```

### Change Excel File Location
Edit `backend.py`:
```python
FEEDBACK_FILE = Path('/path/to/feedback.xlsx')
```

### Change Button Styling
Edit `styles.css` - search for `.doc-btn` and `.feedback-btn` classes

### Change Form Fields
Edit `index.html` - modify the `#feedback-form` element and corresponding fields in `script.js`

## Notes

- The `feedback.xlsx` file is created on first feedback submission
- Multiple feedback entries are appended to the same Excel file
- Timestamps are in local server time
- All feedback data is stored server-side in the Excel file
