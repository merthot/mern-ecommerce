// 404 hatası için middleware
const notFound = (req, res, next) => {
    const error = new Error(`Bulunamadı - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Genel hata işleme middleware'i
const errorHandler = (err, req, res, next) => {
    // Eğer status code 200 ise 500 yap, değilse mevcut status code'u kullan
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Hata detaylarını logla
    console.error('Hata:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
        path: req.path,
        method: req.method,
    });

    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        // Sadece development ortamında ek hata detayları gönder
        ...(process.env.NODE_ENV !== 'production' && {
            path: req.path,
            method: req.method,
        }),
    });
};

export { notFound, errorHandler }; 