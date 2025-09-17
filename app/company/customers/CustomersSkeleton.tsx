/** @format */

const CustomersSkeleton = () => {
    return (
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800 text-gray-200">
              <th className="px-4 py-3 text-left">Ad Soyad</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-center">Puan</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(3)].map((_, idx) => (
              <tr
                key={idx}
                className={`${
                  idx % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                } animate-pulse`}
              >
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-600 rounded w-32"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-600 rounded w-40"></div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="h-4 bg-gray-600 rounded w-12 mx-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default CustomersSkeleton;
  