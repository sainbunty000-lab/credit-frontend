import WorkingCapital from "../modules/WorkingCapital/WorkingCapital";
import Agriculture from "../modules/Agriculture/Agriculture";
import Banking from "../modules/Banking/Banking";

export default function Underwriting() {
  return (
    <div className="space-y-16">

      {/* ===============================
          WORKING CAPITAL MODULE
      =============================== */}
      <div>
        <WorkingCapital />
      </div>

      {/* ===============================
          AGRICULTURE MODULE
      =============================== */}
      <div>
        <Agriculture />
      </div>

      {/* ===============================
          BANKING MODULE
      =============================== */}
      <div>
        <Banking />
      </div>

    </div>
  );
}
