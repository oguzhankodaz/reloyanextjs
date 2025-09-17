/** @format */

const ProductSkeleton = () => {
    return (
      <ul className="space-y-2">
        {[...Array(4)].map((_, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center border p-3 rounded animate-pulse"
          >
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="w-16 h-8 bg-gray-300 rounded"></div>
          </li>
        ))}
      </ul>
    );
  };
  
  export default ProductSkeleton;
  