import Link from 'next/link';
import React from 'react';
import { IoArrowBack } from 'react-icons/io5';

const Orders = () => {
    const ordersData = [
        {
            id: 'R0374915036',
            date: 'Thu, 17th Nov 16',
            products: [
                {
                    name: 'Classic Never Goes Out of Style',
                    size: 'S',
                    qty: 1,
                    price: '$150',
                    image: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.gSSiQwJE1scbihCENxfuDgHaLH%26pid%3DApi&f=1&ipt=4695a17a371b8d9a7ef5c573ac02f8301b09d51c5c2b26d05131b4eb30390efa&ipo=images',
                },
                {
                    name: 'Effortlessly Stylish Shirt',
                    size: 'XL',
                    qty: 1,
                    price: '$120',
                    image: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.SwNa1yjkebtY-Pt8O66_1gHaJ3%26pid%3DApi&f=1&ipt=dd27dcbe7d50a90760c23987751961866489f107136d0d277d32cb32be8e5730&ipo=images',
                },
            ],
            status: 'In-Transit',
            deliveryDate: '24 December 2016',
            total: 270,
            tax: 20,
            shippingCharge: 15,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <header className="bg-[#25384c] text-white py-4 px-6 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">
                    VisualStream
                </Link>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Back Arrow & Text */}
                <div className="flex items-center mb-2 text-sm text-gray-800 hover:text-gray-800">
                    <Link href="/" className="flex items-center space-x-2">
                        <IoArrowBack className="text-lg" />
                        <span>Back</span>
                    </Link>
                </div>

                {/* Page Title */}
                <h1 className="text-2xl font-extrabold text-gray-800 mb-6">My Orders</h1>

                {/* Orders */}
                {ordersData.map((order) => {
                    const grandTotal = order.total + order.tax + order.shippingCharge;

                    return (
                        <div
                            key={order.id}
                            className="bg-white rounded-lg shadow-lg mb-6 border border-gray-300 overflow-hidden"
                        >
                            {/* Order Header */}
                            <div className="bg-gray-100 px-6 py-4 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold">Order ID:</span>{' '}
                                        <span className="text-blue-600 font-bold">{order.id}</span>
                                    </p>
                                    <p className="text-sm text-gray-500">Placed on: {order.date}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'In-Transit'
                                            ? 'bg-orange-100 text-orange-600'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Products */}
                            <div className="px-6 py-4 space-y-4">
                                {order.products.map((product, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-6 border-b border-gray-200 pb-4 last:border-b-0"
                                    >
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-16 h-18 rounded-md object-cover"
                                        />
                                        <div className="flex-grow">
                                            <h2 className="text-lg font-medium text-gray-800">{product.name}</h2>
                                            <p className="text-sm text-gray-500">
                                                Size: {product.size} | Qty: {product.qty}
                                            </p>
                                        </div>
                                        <p className="text-lg font-bold text-gray-800">{product.price}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Order Footer */}
                            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center text-sm text-gray-600">
                                <div>
                                    <p>
                                        <span className="font-semibold">Tax:</span> ${order.tax}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Shipping:</span> ${order.shippingCharge}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold">
                                        Total: <span className="text-lg text-blue-600">${grandTotal.toFixed(2)}</span>
                                    </p>
                                </div>
                                <div>
                                    <p>
                                        Delivery By: <span className="font-semibold">{order.deliveryDate}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </main>
        </div>
    );
};

export default Orders;
