import PDFParser from 'pdf2json';

export const extractTextFromPDF = (buffer) => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(this, 1);

        pdfParser.on('pdfParser_dataError', (errData) => {
            console.error('--- ACTUAL PDF ERROR ---');
            console.error(errData.parserError);
            reject(new Error('Failed to parse PDF document'));
        });

        pdfParser.on('pdfParser_dataReady', () => {
            const rawText = pdfParser.getRawTextContent();
            resolve(rawText);
        });

        pdfParser.parseBuffer(buffer);
    });
};