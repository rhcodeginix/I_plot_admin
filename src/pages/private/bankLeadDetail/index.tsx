import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchBankLeadData } from "../../../lib/utils";
import { Spinner } from "../../../components/Spinner";

export const BankLeadsDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const id = pathSegments.length > 2 ? pathSegments[2] : null;
  const [loading, setLoading] = useState(true);
  const [bankData, setBankData] = useState<any>();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const getData = async () => {
      const data = await fetchBankLeadData(id);

      if (data) {
        setBankData(data);
      }

      setLoading(false);
    };

    getData();
  }, [id]);

  return (
    <>
      {loading && <Spinner />}

      <div className="px-8 pt-4 pb-8 flex flex-col gap-6 bg-[#F5F3FF]">
        <div className="flex items-center gap-1">
          <span
            className="text-[#7839EE] text-sm font-medium cursor-pointer"
            onClick={() => navigate("/bank-leads")}
          >
            Leads sendt til banken
          </span>
          <ChevronRight className="h-4 w-4 text-[#5D6B98]" />
          <span className="text-[#5D6B98] text-sm">
            Detaljer om potensielle kunder
          </span>
        </div>
        <div className="text-darkBlack text-[2rem] font-medium">
          #{id} ( {bankData?.Kunden?.Kundeinformasjon[0]?.f_name}{" "}
          {bankData?.Kunden?.Kundeinformasjon[0]?.l_name})
        </div>
      </div>
    </>
  );
};
