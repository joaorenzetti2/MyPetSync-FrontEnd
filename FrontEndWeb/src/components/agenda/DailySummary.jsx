import React, { useMemo } from "react";
import { VscCheck, VscCalendar, VscHistory } from "react-icons/vsc";
import { LuHandshake } from "react-icons/lu";

const DailySummary = ({ appointments = [] }) => {
  const summaryData = useMemo(() => {
    const total = appointments.length;

    const completed = appointments.filter(
      (appt) => appt.status === "completed"
    ).length;

    const confirmed = appointments.filter(
      (appt) => appt.status === "confirmed"
    ).length;

    const scheduledAndPending = appointments.filter(
      (appt) => appt.status === "scheduled" || appt.status === "pending"
    ).length;

    return { total, completed, confirmed, pending: scheduledAndPending };
  }, [appointments]);

  return (
    <div className="w-80 bg-white p-6 rounded-xl shadow-lg flex flex-col h-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">
        Resumo do Dia
      </h2>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <VscCalendar className="w-6 h-6 text-teal-600 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500">Total de agendamentos</p>
            <p className="text-2xl font-bold text-gray-800">
              {summaryData.total}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <LuHandshake className="w-6 h-6 text-green-700 flex-shrink-0" />{" "}
          <div>
            <p className="text-sm text-gray-500">Concluídos</p>
            <p className="text-2xl font-bold text-green-700">
              {summaryData.completed}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <VscCheck className="w-6 h-6 text-blue-700 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500">Confirmados</p>
            <p className="text-2xl font-bold text-blue-700">
              {summaryData.confirmed}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <VscHistory className="w-6 h-6 text-yellow-700 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500">Agendados/Pendentes</p>
            <p className="text-2xl font-bold text-yellow-700">
              {summaryData.pending}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
