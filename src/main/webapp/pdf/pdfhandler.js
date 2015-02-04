
function displayPDF (url){
    if(typeof(url)==='undefined') url = 'pdf/test.pdf';
    alert(url);

    //
    // Disable workers to avoid yet another cross-origin issue (workers need
    // the URL of the script to be loaded, and dynamically loading a cross-origin
    // script does not work).
    //
    // PDFJS.disableWorker = true;

    //
    // In cases when the pdf.worker.js is located at the different folder than the
    // pdf.js's one, or the pdf.js is executed via eval(), the workerSrc property
    // shall be specified.
    //
    // PDFJS.workerSrc = '../../build/pdf.worker.js';

    //
    // Asynchronous download PDF
    //
    PDFJS.getDocument(url).then(function (pdf) {
      //
      // Fetch the first page
      //
      pdf.getPage(1).then(function (page) {
        var scale = 1.5;
        var viewport = page.getViewport(scale);

        //
        // Prepare canvas using PDF page dimensions
        //
        var canvasElement = canvas.canvasElement;
        var context = canvas.ctx;
        canvasElement.height = viewport.height;
        canvasElement.width = viewport.width;
        canvas.lineWidth(canvas.thickness);

        //
        // Render PDF page into canvas context
        //
        var renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        page.render(renderContext);
      });
    });   
}

