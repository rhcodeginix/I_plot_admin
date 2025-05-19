import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { db } from "../../../config/firebaseConfig";
import Img_line_bg from "../../../assets/images/Img_line_bg.png";
import NorkartMap from "../../../components/map";

export const UserDetail = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (id) {
      setLoading(true);

      const fetchUser = async () => {
        try {
          const userDocRef = doc(db, "users", id);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();

            const propertiesCollectionRef = collection(
              db,
              "users",
              id,
              "property"
            );
            const propertiesSnapshot = await getDocs(propertiesCollectionRef);

            const properties = propertiesSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setData({ ...userData, properties });
            setLoading(false);
          }
        } catch (error) {
          setLoading(false);
          console.error("Error fetching user data:", error);
        }
      };

      fetchUser();
    }
  }, [id]);

  const totalPages = data?.properties
    ? Math.ceil(data.properties.length / itemsPerPage)
    : 1;

  const paginatedProperties = data?.properties?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="bg-lightPurple py-[20px] relative px-6">
        <img
          src={Img_line_bg}
          alt="images"
          className="absolute top-0 left-0 w-full h-full"
          style={{ zIndex: 1 }}
        />
        <div style={{ zIndex: 9 }}>
          {loading ? (
            <div
              className="w-[300px] h-[30px] rounded-md custom-shimmer mb-2"
              style={{ borderRadius: "8px" }}
            ></div>
          ) : (
            <h2 className="text-black text-[32px] font-semibold mb-2">
              {data?.name}
            </h2>
          )}
          {loading ? (
            <div
              className="w-[300px] h-[30px] rounded-md custom-shimmer"
              style={{ borderRadius: "8px" }}
            ></div>
          ) : (
            <p className="text-gray text-xl">{data?.email}</p>
          )}
        </div>
      </div>
      <div className="px-6 pt-6 pb-16 flex flex-col gap-6">
        <h4 className="text-gray text-xl">
          Søk Eiendom Count:{" "}
          <span className="text-black font-semibold">
            {data?.properties?.length}
          </span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 desktop:grid-cols-4 gap-x-4 lg:gap-x-6 desktop:gap-x-8 gap-y-7 lg:gap-y-9 desktop:gap-y-12">
          {loading ? (
            <>
              <div
                className="w-full h-[400px] rounded-md custom-shimmer mb-2"
                style={{ borderRadius: "8px" }}
              ></div>
              <div
                className="w-full h-[400px] rounded-md custom-shimmer mb-2"
                style={{ borderRadius: "8px" }}
              ></div>
              <div
                className="w-full h-[400px] rounded-md custom-shimmer mb-2"
                style={{ borderRadius: "8px" }}
              ></div>
              <div
                className="w-full h-[400px] rounded-md custom-shimmer mb-2"
                style={{ borderRadius: "8px" }}
              ></div>
              <div
                className="w-full h-[400px] rounded-md custom-shimmer mb-2"
                style={{ borderRadius: "8px" }}
              ></div>
              <div
                className="w-full h-[400px] rounded-md custom-shimmer mb-2"
                style={{ borderRadius: "8px" }}
              ></div><div
              className="w-full h-[400px] rounded-md custom-shimmer mb-2"
              style={{ borderRadius: "8px" }}
            ></div>
            <div
                className="w-full h-[400px] rounded-md custom-shimmer mb-2"
                style={{ borderRadius: "8px" }}
              ></div>
            </>
          ) : (
            <>
              {paginatedProperties?.length > 0 ? (
                paginatedProperties.map((property: any, index: number) => {
                  return (
                    <Link
                      key={index}
                      to={`/property?propertyId=${property?.id}&&userId=${id}`}
                      className="relative"
                    >
                      <div className="flex flex-col gap-3 cursor-pointer relative z-40">
                        <div className="h-[300px] md:h-[350px] cursor-pointer rounded-lg overflow-hidden">
                          {/* <GoogleMapComponent
                            coordinates={
                              property?.lamdaDataFromApi?.coordinates
                                ?.convertedCoordinates
                            }
                          /> */}
                          {property?.lamdaDataFromApi?.coordinates
                            ?.convertedCoordinates && (
                            <NorkartMap
                              coordinates={
                                property?.lamdaDataFromApi?.coordinates
                                  ?.convertedCoordinates
                              }
                            />
                          )}
                        </div>
                        <h4 className="text-black font-medium text-base lg:text-lg">
                          {property?.getAddress?.adressetekst ||
                            `${property?.CadastreDataFromApi?.presentationAddressApi?.response?.item?.formatted?.line1}
                            ${property?.CadastreDataFromApi?.presentationAddressApi?.response?.item?.formatted?.line2}`}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="text-gray text-sm">
                            Gnr:{" "}
                            <span className="text-black font-semibold">
                              {
                                property?.lamdaDataFromApi?.searchParameters
                                  ?.gardsnummer
                              }
                            </span>
                          </div>
                          <div className="h-[12px] w-[1px] border-l border-gray1"></div>
                          <div className="text-gray text-sm">
                            Bnr:{" "}
                            <span className="text-black font-semibold">
                              {
                                property?.lamdaDataFromApi?.searchParameters
                                  ?.bruksnummer
                              }
                            </span>
                          </div>
                          <div className="h-[12px] w-[1px] border-l border-gray1"></div>
                          <div className="text-gray text-sm">
                            Snr:{" "}
                            <span className="text-black font-semibold">
                              {property?.getAddress?.bokstav}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute z-50 top-0 left-0 h-full w-full"></div>
                    </Link>
                  );
                })
              ) : (
                <p>No Search History found.</p>
              )}
            </>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 border rounded ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-2 border rounded">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-4 py-2 border rounded ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};
