function tryCatchHandler(middleware, controller) {
    return async (req, res, next) => {
        try {
            // Check if middleware is a function before calling it
            if (middleware && typeof middleware === 'function') {
                await middleware(req, res, next);
            }

            // Execute the main controller logic
            await controller(req, res, next);
        } catch (err) {
            // Log the error with file and line number
            const stack = err.stack || "";
            const [ , fileAndLine ] = stack.split("\n")[1].trim().match(/\(([^)]+)\)/) || [];
            console.error(`Error: ${err.message} \nOccurred at: ${fileAndLine || 'Unknown location'}`);
            
            // Handle the error (send response or pass it to the next middleware)
            res.status(500).send({ message: "An error occurred", error: err.message });
        }
    };
}

module.exports = { tryCatchHandler };
