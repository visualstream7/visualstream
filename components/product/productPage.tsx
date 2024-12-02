import { UserResource } from '@clerk/types';
import React, { useState } from 'react';
import Nav from '../nav';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, LocateIcon, MapIcon, MapPinCheckIcon } from 'lucide-react';
import { TbLocationDiscount } from 'react-icons/tb';

interface ProductPageProps {
  id: string;
  image_id: string;
  user: UserResource | null | undefined;

}


const ProductPage: React.FC<ProductPageProps> = ({ id, image_id, user }) => {

  const [selectedColor, setSelectedColor] = useState<string>('Black');
  return (
    <div className='flex h-dvh flex-col overflow-hidden'>
      <Nav user={user} />
      <div className='flex flex-col overflow-auto'>
        <div className='flex-1 flex lg:flex-row justify-center items-start mt-10  gap-6 p-6'>

          <div className="flex bg-gray-400">
            <img
              src="/productImages/bigImage.jpg"
              alt="Product"
              className=" max-w[80vw] opacity-90"
            />
          </div>

          {/* Middle Section: Product Details */}
          <div className="flex flex-col  p-3">
            <h3 className='text-[#41747d] text-sm'>Brand WDIRARA</h3>
            <h2 className="flex text-2xl font-medium text-[#565958] text-wrap max-w-[30vw] text-justify ">Amazon Essentials Men's Lightweight French Terry Full-Zip Hoodie</h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center">
                <p>4.5</p>
                <span className="text-[#de7921] text-xl">★★★★☆</span>
                <ChevronDownIcon />
              </div>
              <a href="#ratings" className="text-[#2e616a] text-sm font-normal ">
                Total ratings
              </a>
              <p className='text-[#575859]'>|</p>
              <a href="#search" className="text-[#2e616a] text-sm font-normal">
                Search this page
              </a>
            </div>

            <hr className="my-2  border-t-1 border-gray-400" />

            <div >
              <div className='flex items-center gap-2'>
                <span className='text-sm'>Price:</span>
                <p className="text-xl text-[#803d2c]"> $24.70</p>
              </div>
              <p className="text-gray-500 mt-1">All prices include VAT</p>
            </div>

            <div className="mt-4">
              <label htmlFor="size" className="block text-sm text-[#646464]  font-medium">
                Size
              </label>
              <select id="size" className="mt-1 p-2 border text-[#414342] rounded-md w-[5vw] text-sm outline-1 outline-[#6ba5b1] border-[#c2d5d9] ">
                <option >Select</option>
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
              <div className="flex gap-2 mt-2 flex-wrap">
                {[
                  { id: 1, src: '/productImages/1.jpg', alt: 'Black' },
                  { id: 2, src: '/productImages/2.jpg', alt: 'Blue' },
                  { id: 3, src: '/productImages/3.jpg', alt: 'Charcoal Heather' },
                  { id: 4, src: '/productImages/4.jpg', alt: 'Dark Navy' },
                  { id: 5, src: '/productImages/5.jpg', alt: 'French Blue' },
                  { id: 6, src: '/productImages/6.jpg', alt: 'Indigo' },
                  { id: 7, src: '/productImages/7.jpg', alt: 'Light Grey Heather' },
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



            <hr className="my-6 border-t-1 border-gray-400" />

            <div>
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

          {/* Right Section: Price and Actions */}
          <div className="w-[280px]  border border-gray-500 rounded-md p-4 shadow-md">
            <p className="text-2xl font-medium text-[#565958]">SAR203.14</p>
            <p className="text-sm mt-1 text-gray-600">SAR96 delivery 6-9 October</p>
            <button className="text-[#2e616a] font-medium mt-1 text-sm">Details</button>
            <p className="mt-2 text-sm text-[#2e616a] ">
              <MapPinCheckIcon className="h-4 w-4 inline mr-1" />
              Delivery to Riyadh <button className="text-[#2e616a] font-medium">Update Location</button>
            </p>
            <p className="mt-4 text-red-600 font-medium">Usually ships within 4 to 5 days</p>

            <div className="mt-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-600">
                Quantity
              </label>
              <select
                id="quantity"
                className="mt-1 p-2 border rounded-md w-full text-sm outline-1 outline-blue-500 border-gray-300"
              >
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
              </select>
            </div>

            <button className="w-full bg-[#fed813] text-black font-medium py-2 rounded-3xl mt-4">
              Add to Cart
            </button>
            <button className="w-full bg-[#ffa41d] text-white font-bold py-2 rounded-3xl mt-2">
              Buy Now
            </button>

            <div className="mt-4 text-sm">
              <ul className="list-none pl-0">
                <li className="flex mt-2">
                  <span className="w-20 font-medium text-gray-900">Ships from</span>
                  <span className="text-[#6ba5b1]">San Diego</span>
                </li>
                <li className="flex mt-2">
                  <span className="w-20 font-medium text-gray-900">Sold by</span>
                  <span className="text-[#6ba5b1]">VisualStream</span>
                </li>
                <li className="flex mt-2">
                  <span className="w-20 font-medium text-gray-900">Payment</span>
                  <span className="text-gray-700">Secure transaction</span>
                </li>
              </ul>
            </div>


            <button className="w-full border bg-[#edfcff] border-[#62888f] hover:bg-[#f3f6f7] py-2 rounded-xl mt-4 text-sm">Add to List</button>
          </div>


        </div>  
        <div className="mt-8 flex justify-center mb-10">
          <div>
            {/* Title Section */}
            <div className="text-xl font-semibold mb-4">
              <h3 className="text-left">Products related to this item</h3>
            </div>

            {/* Carousel Section */}
            <div className="relative flex items-center">
              {/* Left Arrow */}
              <button className="bg-gray-300 border rounded-full shadow p-2">
                <ChevronLeftIcon />
              </button>

              {/* Carousel */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {[13, 14, 15, 16, 17].map((item) => (
                  <div
                    key={item}
                    className="flex flex-col border rounded-lg shadow-sm w-[200px] min-w-[200px] bg-white p-3">
                    <img
                      src={`/productImages/${item}.jpg`}
                      alt={`Product ${item}`}
                      className="rounded-md mb-2"
                    />
                    <p className="text-sm font-medium text-[#007185] truncate">
                      Product Title Goes Here {item}
                    </p>
                    <p className="text-sm text-gray-500">SAR 106.86</p>
                    <p className="flex items-center text-sm">
                      <span className="text-[#de7921] text-xl">★★★★☆</span>
                      <span className="text-gray-500 text-xs ml-1">(321)</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Right Arrow */}
              <button className="bg-gray-300 border rounded-full shadow p-2">
                <ChevronRightIcon />
              </button>
            </div>
          </div>
          
        </div>

      </div>
      
    </div>
  );
};

export default ProductPage;
