export default function html({ wss }) {
    const startTime = Date.now();

    const templateHtmlFile = /* html */`
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fragment</title>
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="/bundle.js"></script>
        <script>
            window.__FRAGMENT_TIME__ = ${startTime};
            window.__FRAGMENT_WSS_PORT__ = ${wss.port};
        </script>
    </body>
</html>
`;

    return (req, res, next) => {
        if (req.url === "/") {
            const html = Buffer.from(templateHtmlFile, 'utf8');;
            res.end(html);
        }

        next();
    };
}
