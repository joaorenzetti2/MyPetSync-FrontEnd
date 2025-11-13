import { VscAdd, VscEdit } from "react-icons/vsc";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

const scheduleHours = Array.from({ length: 11 }, (_, i) => {
  const hour = 8 + i;
  return `${hour < 10 ? "0" : ""}${hour}:00`;
});

const statusMap = {
  scheduled: { text: "Agendado", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { text: "Confirmado", color: "bg-blue-100 text-blue-700" },
  completed: { text: "Concluído", color: "bg-green-100 text-green-700" },
  canceled: { text: "Cancelado", color: "bg-red-100 text-red-700" },
};

const DailySchedule = ({
  appointments = [],
  selectedDate,
  onAddAppointment = () => {},
  onAppointmentClick = () => {},
}) => {
  let dateObj = parseISO(selectedDate || new Date().toISOString());
  if (!isValid(dateObj)) dateObj = new Date();

  const formattedDate = format(dateObj, "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const appointmentsByTime = appointments.reduce((acc, appt) => {
    let time = "00:00";
    if (appt?.dateTime) {
      const parsed = parseISO(appt.dateTime);
      if (isValid(parsed)) time = format(parsed, "HH:mm");
    }

    const fullApptData = {
      ...appt,
      id: appt._id,
      time,
      petName: appt.pet?.nome || appt.pet?.name || "Pet",
      clientInfo: appt.reason || appt.location || "Detalhe não informado",
      status: appt.status || "scheduled",
    };

    if (!acc[time]) acc[time] = [];
    acc[time].push(fullApptData);
    return acc;
  }, {});

  const getAppointmentByTime = (time) => appointmentsByTime[time] || [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-700">{formattedDate}</h2>
        <span className="text-gray-500 font-medium">
          {appointments.length} agendamentos
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {scheduleHours.map((time) => {
          const appointmentsAtTime = getAppointmentByTime(time);

          return (
            <div
              key={time}
              className="flex items-center border border-gray-200 rounded-lg p-3 transition-shadow hover:shadow-md"
            >
              <div className="w-20 font-bold text-gray-800 text-lg flex-shrink-0">
                {time}
              </div>

              <div className="flex-grow ml-4 border-l border-teal-600 pl-4">
                {appointmentsAtTime.length > 0 ? (
                  appointmentsAtTime.map((appointment) => {
                    const status = statusMap[appointment.status] || {
                      text: "Indefinido",
                      color: "bg-gray-100 text-gray-700",
                    };

                    return (
                      <div
                        key={appointment.id}
                        className="flex justify-between items-center text-teal-700 mb-2 last:mb-0"
                      >
                        <div>
                          <p className="font-bold">{appointment.petName}</p>
                          <p className="text-sm text-gray-500">
                            {appointment.clientInfo}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${status.color}`}
                          >
                            {status.text}
                          </span>
                          <button
                            onClick={() => onAppointmentClick(appointment)}
                            className="text-gray-500 hover:text-teal-600 p-1 rounded"
                          >
                            <VscEdit className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <button
                    onClick={() => onAddAppointment(time)}
                    className="flex items-center text-teal-600 font-medium hover:text-teal-700 transition-colors"
                  >
                    <VscAdd className="w-4 h-4 mr-2" />
                    Adicionar agendamento
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailySchedule;
