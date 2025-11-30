# PDF Manipulator SPA

## Overview
PDF Manipulator SPA is a single-page application designed for manipulating PDF files. Users can upload PDF documents, change the number of pages per sheet for printing, rotate pages, and modify borders. The application is optimized for high performance on both desktop and mobile devices and is suitable for hosting on GitHub Pages.

## Features
- Upload PDF files for manipulation.
- Change the number of pages per sheet for printing.
- Rotate individual pages.
- Modify borders of the PDF pages.
- Real-time preview of changes.

## Technologies Used
- React: A JavaScript library for building user interfaces.
- TypeScript: A typed superset of JavaScript that compiles to plain JavaScript.
- Vite: A fast build tool and development server.
- CSS: For styling the application.

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node package manager)

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pdf-manipulator-spa.git
   ```
2. Navigate to the project directory:
   ```
   cd pdf-manipulator-spa
   ```
3. Install the dependencies:
   ```
   npm install
   ```

### Running the Application
To start the development server, run:
```
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to view the application.

### Building for Production
To build the application for production, run:
```
npm run build
```
The built files will be available in the `dist` directory.

### Hosting on GitHub Pages
1. Build the application as mentioned above.
2. Deploy the contents of the `dist` directory to your GitHub Pages branch (usually `gh-pages`).

## Usage
1. Upload a PDF file using the uploader component.
2. Use the border controls to adjust the borders of the pages.
3. Specify the number of pages per sheet and rotate pages as needed.
4. Preview the changes in real-time before finalizing.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.