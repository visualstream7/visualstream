import { UserResource } from '@clerk/types';
import React, { useState } from 'react';
import Nav from '../nav';
import { ChevronDownIcon } from 'lucide-react';

interface ProductPageProps {
  id: string;
  image_id: string;
  user: UserResource | null | undefined;

}


const ProductPage: React.FC<ProductPageProps> = ({ id, image_id, user }) => {

  const [selectedColor, setSelectedColor] = useState<string>('Black');
  return (
    <div>
      <Nav user={user} />
      <div className="flex flex-col md:flex-row gap-6 p-6">

        {/* Left Section: Big Image */}
        <div className="flex-1 flex justify-center items-center">
          <img
            src="/productImages/bigImage.jpg"
            alt="Product"
            className="max-w-[70vw] max-h-[70vh] object-contain"
          />
        </div>

        {/* Middle Section: Product Details */}
        <div className="flex-2 mt-10">
          <h3 className='text-[#6ba5b1] text-sm'>Brand WDIRARA</h3>
          <h2 className="text-2xl font-medium text-[#575859]">Amazon Essentials Men's Lightweight French Terry Full-Zip Hoodie</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center">
              <p>4.5</p>
              <span className="text-[#de7921] text-xl">★★★★☆</span>
              <ChevronDownIcon />
            </div>
            <a href="#ratings" className="text-[#6ba5b1] underline">
              Total ratings
            </a>
            <p className='text-[#575859]'>|</p>
            <a href="#search" className="text-[#6ba5b1] underline">
              Search this page
            </a>
          </div>

          <hr className="my-2" />

          <div >
            <p className="text-2xl ">$24.70</p>
            <p className="text-gray-500 mt-1">All prices include VAT</p>
          </div>

          <div className="mt-4">
            <label htmlFor="size" className="block text-sm text-gray-500  font-medium">
              Size
            </label>
            <select id="size" className="mt-1 p-2 border rounded-md w-[5vw] text-sm outline-1 outline-[#6ba5b1] border-[#c2d5d9] ">
              <option>Select</option>
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
              <option>X-Large</option>
              <option>XX-Large</option>
            </select>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">
              Color: <span className="text-gray-700">{selectedColor}</span>
            </p>
            <div className="flex gap-2 mt-2">
              {[
                { id: 1, src: '/productImages/1.jpg', alt: 'Black' },
                { id: 2, src: '/productImages/2.jpg', alt: 'Blue' },
                { id: 3, src: '/productImages/3.jpg', alt: 'Charcoal Heather' },
                { id: 4, src: '/productImages/4.jpg', alt: 'Dark Navy' },
                { id: 5, src: '/productImages/5.jpg', alt: 'French Blue' },
                { id: 6, src: '/productImages/6.jpg', alt: 'Indigo' },
                {id: 7, src: '/productImages/7.jpg', alt: 'Light Grey Heather' },
                { id: 8, src: '/productImages/8.jpg', alt: 'Mint Green' },
                { id: 9, src: '/productImages/9.jpg', alt: 'Oatmeal Heather' },
                { id: 10, src: '/productImages/10.jpg', alt: 'Pink' },
                { id: 11, src: '/productImages/11.jpg', alt: 'Tan' },
                { id: 12, src: '/productImages/12.jpg', alt: 'Teal Blue' },
                
              ].map((color) => (
                <img
                  key={color.id}
                  src={color.src}
                  alt={color.alt}
                  className={`w-10 h-10 border rounded-md cursor-pointer ${selectedColor === color.alt ? 'border-blue-500' : 'border-gray-300'
                    }`}
                  onClick={() => setSelectedColor(color.alt)}
                />
              ))}
            </div>
          </div>


          <div className="mt-6">
            <h3 className="text-lg font-semibold">Product Details</h3>
            <ul className="list-none pl-0 mt-2 text-sm">
              <li className="flex">
                <span className="w-40 font-medium text-gray-900">Material composition</span>
                <span className="text-gray-700">99% Polyester, 1% Elastane</span>
              </li>
              <li className="flex mt-2">
                <span className="w-40 font-medium text-gray-900">Closure type</span>
                <span className="text-gray-700">Pull On</span>
              </li>
              <li className="flex mt-2">
                <span className="w-40 font-medium text-gray-900">Neck style</span>
                <span className="text-gray-700">Scoop Neck</span>
              </li>
              <li className="flex mt-2">
                <span className="w-40 font-medium text-gray-900">Sleeve type</span>
                <span className="text-gray-700">Short Sleeve</span>
              </li>
            </ul>
          </div>



          <hr className="my-6" />

          <div className="mt-6">
            <h3 className="text-lg font-semibold">About this item</h3>
            <ul className="list-none pl-0 mt-2 text-sm">
              <li className="flex mt-2">
                <span className="w-40 font-medium text-gray-900">Regular Fit</span>
                <span className="text-gray-700">Comfortable, easy fit through the shoulders, chest, and waist</span>
              </li>
              <li className="flex mt-2">
                <span className="w-40 font-medium text-gray-900">Fabric</span>
                <span className="text-gray-700">Lightweight French Terry: Naturally soft, stretchy, and breathable</span>
              </li>
              <li className="flex mt-2">
                <span className="w-40 font-medium text-gray-900">Style</span>
                <span className="text-gray-700">Lightweight and comfortable for all-day wear</span>
              </li>
              <li className="flex mt-2">
                <span className="w-40 font-medium text-gray-900">Details</span>
                <span className="text-gray-700">Hood, kangaroo pocket, full zipper, ribbing at cuffs and hem</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Right Section: Purchase Options */}
        <div className="flex-1 border-2 rounded-md p-4">
          <p className="text-2xl font-bold">$24.70</p>
          <p className="text-sm mt-1">SAR96 delivery 6-9 October</p>
          <button className="text-blue-500 underline mt-1">Details</button>
          <p className="mt-2">
            Deliver to Bangladesh <button className="text-blue-500 underline">Update location</button>
          </p>
          <p className="mt-4 text-green-600 font-medium">In Stock</p>
          <div className="mt-4">
            <label htmlFor="quantity" className="block text-sm font-medium">
              Quantity
            </label>
            <select id="quantity" className="mt-1 p-2 border rounded-md w-full">
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
          </div>

          <button className="w-full bg-[#fed813] text-black font-bold py-2 rounded-md mt-4">
            Add to Cart
          </button>
          <button className="w-full bg-[#ffa41d] text-white font-bold py-2 rounded-md mt-2">
            Buy Now
          </button>

          <div className="mt-4 text-sm">
            <p>
              Ships from <span className="text-[#6ba5b1]">San Diego</span>
            </p>
            <p>
              Sold by <span className="text-[#6ba5b1]">VisualStream</span>
            </p>
            <p>Payment: Secure transaction</p>
          </div>

          <button className="w-full border py-2 rounded-md mt-4">Add to List</button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
