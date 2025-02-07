import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

// @desc    Yeni sipariş oluştur
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
    } = req.body;


    if (!orderItems || orderItems.length === 0) {
        res.status(400);
        throw new Error('Sipariş ürünü bulunamadı');
    }

    try {
        // Stok kontrolü
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                res.status(404);
                throw new Error(`Ürün bulunamadı: ${item.name}`);
            }

            // Seçilen beden için stok kontrolü
            const stockForSize = product.sizeStock.get(item.size) || 0;

            if (stockForSize < item.qty) {
                res.status(400);
                throw new Error(`${product.name} için ${item.size} bedeninde yeterli stok yok`);
            }
        }

        const order = new Order({
            user: req.user._id,
            orderItems: await Promise.all(orderItems.map(async item => {
                const product = await Product.findById(item.product);
                return {
                    ...item,
                    product: item.product,
                    size: item.size,
                    color: item.color || product.color
                };
            })),
            shippingAddress: {
                fullName: shippingAddress.fullName,
                email: shippingAddress.email,
                phone: shippingAddress.phone,
                address: shippingAddress.address,
                city: shippingAddress.city,
                postalCode: shippingAddress.postalCode,
                country: shippingAddress.country,
                shippingMethod: shippingAddress.shippingMethod
            },
            paymentMethod,
            itemsPrice: Number(itemsPrice),
            shippingPrice: Number(shippingPrice),
            totalPrice: Number(totalPrice)
        });

        // Stok güncelleme
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new Error(`Ürün bulunamadı: ${item.name}`);
            }

            const qty = Number(item.qty || 1);
            const currentStock = Number(product.sizeStock.get(item.size) || 0);
            const newStock = Math.max(0, currentStock - qty);

            try {
                product.sizeStock.set(item.size, newStock);
                await product.save();
            } catch (error) {
                throw new Error(`${item.name} için stok güncellenirken hata oluştu`);
            }
        }

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500);
        throw error;
    }
});

// @desc    Kullanıcının siparişlerini getir
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

// @desc    Sipariş detayını ID'ye göre getir
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (order) {
        // Siparişin kullanıcıya ait olup olmadığını kontrol et
        if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(401);
            throw new Error('Bu siparişi görüntüleme yetkiniz yok');
        }
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Sipariş bulunamadı');
    }
});

// @desc    Siparişi ödenmiş olarak güncelle
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };
        order.status = 'İşleniyor';

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Sipariş bulunamadı');
    }
});

// @desc    Sipariş durumunu güncelle
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = req.body.status;
        if (req.body.status === 'Teslim Edildi') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Sipariş bulunamadı');
    }
});

// @desc    Tüm siparişleri getir
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})
        .populate({
            path: 'user',
            select: 'name email phone'
        })
        .sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Siparişi sil
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        await order.deleteOne();
        res.json({ message: 'Sipariş silindi' });
    } else {
        res.status(404);
        throw new Error('Sipariş bulunamadı');
    }
}); 