/* eslint-disable @typescript-eslint/no-explicit-any */

const ApiUtils = {
  getAddress: async function (value: any) {
    try {
      const response = await fetch(
        `https://ws.geonorge.no/adresser/v1/sok?sok=${value}`
      );
      return response;
    } catch (error: any) {
      throw error.response;
    }
  },

  getSingleAddress: async function (params: Record<string, any>) {
    try {
      const url = `https://ws.geonorge.no/adresser/v1/sok?sok=${`${params.adressenavn} ${params.nummer}`}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("Error fetching address:", error);
      throw error;
    }
  },
  handleLookup: async (phoneNumber: string) => {
    if (!phoneNumber) return;
    const cleanedNumber = phoneNumber.replace(/\D/g, "").replace(/^47/, "");
    try {
      const response = await fetch(
        `https://services.api1881.no/lookup/phonenumber/${cleanedNumber}`,
        {
          method: "GET",
          headers: {
            "Ocp-Apim-Subscription-Key": "cce12bb764f34e9083eec0f57fd0dc53",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      console.error(err);
    }
  },
};

export default ApiUtils;
