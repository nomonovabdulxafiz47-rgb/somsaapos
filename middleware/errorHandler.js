function errorHandler(err, req, res, next) {
    console.error("Server xatosi:", err.message || err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Serverda ichki xatolik yuz berdi"
    });
}

module.exports = errorHandler;
