import React, { useState, useEffect, useCallback } from "react";
import {
  VscClose,
  VscTag,
  VscInfo,
  VscPerson,
  VscMail,
  VscTrash,
} from "react-icons/vsc";
import { MdOutlinePets, MdOutlineWatchLater } from "react-icons/md";
import { FiPhoneCall } from "react-icons/fi";
import {
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../../services/agendaService";
import { searchPets } from "../../services/petService";

const STATUS_MAP = {
  Agendado: "scheduled",
  Confirmado: "confirmed",
  Concluído: "completed",
};
const DURATION_MAP = { "30 min": 30, "60 min": 60, "90 min": 90 };
const STATUS_MAP_REVERSE = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  canceled: "Cancelado",
};

const Section = ({ title, icon: Icon, color, children, className = "" }) => (
  <div className={`p-4 rounded-lg ${className}`}>
    <h3 className={`font-semibold mb-4 flex items-center ${color}`}>
      <Icon className="w-5 h-5 mr-2" /> {title}
    </h3>
    {children}
  </div>
);

const Input = ({
  label,
  icon: Icon,
  placeholder,
  type = "text",
  name,
  value,
  onChange,
  ...rest
}) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-[#F0F0F0] mb-1">{label}</label>

    <div className="relative">
      {Icon && (
        <Icon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-2.5 rounded-lg border border-gray-300 focus:ring-teal-500 focus:border-teal-500 text-gray-800 ${
          Icon ? "pl-10" : "pl-3"
        }`}
        {...rest}
      />
    </div>
  </div>
);

const TextArea = ({ placeholder, name, value, onChange }) => (
  <div className="flex flex-col mt-4">
    <textarea
      placeholder={placeholder}
      rows="3"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-teal-500 focus:border-teal-500 text-gray-800 bg-white"
    ></textarea>
  </div>
);

const Select = ({
  label,
  options,
  defaultMessage = "Selecione o serviço...",
  name,
  value,
  onChange,
}) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-[#F0F0F0] mb-1">{label}</label>

    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-teal-500 focus:border-teal-500 text-gray-800 appearance-none bg-white"
    >
      <option value="" disabled>
        {defaultMessage}
      </option>

      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const StatusRadios = ({ value, onChange }) => (
  <div className="mb-4">
    <label className="text-sm font-medium text-gray-700 block mb-2">
      Status do Agendamento
    </label>

    <div className="flex gap-6">
      {["Agendado", "Confirmado", "Concluído"].map((status) => (
        <label
          key={status}
          className="flex items-center space-x-2 text-gray-800"
        >
          <input
            type="radio"
            name="status"
            value={status}
            checked={value === status}
            onChange={() => onChange(status)}
            className="text-teal-600 focus:ring-teal-500"
          />
          <span>{status}</span>
        </label>
      ))}
    </div>
  </div>
);

const getInitialFormData = (appt, initialTime, initialDate) => {
  if (appt && appt._id) {
    const date = new Date(appt.dateTime);
    const durationInMin = appt.duration;
    const clientName = appt.pet.tutorId?.name || "";

    return {
      petName: appt.pet.nome || "",
      clientName,
      phone: appt.phone,
      email: appt.email,
      date: date.toISOString().split("T")[0],
      time: date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      serviceType: appt.reason || "",
      notes: appt.notes || "",
      duration:
        Object.keys(DURATION_MAP).find(
          (key) => DURATION_MAP[key] === durationInMin
        ) || "60 min",
      status: STATUS_MAP_REVERSE[appt.status] || "Agendado",
    };
  }

  return {
    petName: "",
    clientName: "",
    phone: "",
    email: "",
    serviceType: "",
    date: initialDate || new Date().toISOString().split("T")[0],
    time: initialTime || "08:00",
    duration: "60 min",
    status: "Agendado",
    notes: "",
  };
};

const NewAppointmentModal = ({
  isOpen,
  onClose,
  initialTime,
  onAppointmentSaved,
  appointmentToEdit,
  providerId,
  isLoadingProvider,
  initialDate,
}) => {
  const [selectedPetId, setSelectedPetId] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState(
    getInitialFormData(appointmentToEdit, initialTime, initialDate)
  );

  useEffect(() => {
    setFormData(
      getInitialFormData(appointmentToEdit, initialTime, initialDate)
    );

    if (appointmentToEdit) {
      setSelectedPetId(appointmentToEdit.pet._id);
    } else {
      setSelectedPetId("");
    }
    setError(null);
  }, [appointmentToEdit, initialTime, isOpen, initialDate]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "petName") setSelectedPetId("");
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (formData.petName.length > 2 && !selectedPetId) {
        setIsSearching(true);
        try {
          const results = await searchPets(formData.petName);
          setSearchResults(results);
        } catch (err) {
          console.error("Erro na busca de Pets:", err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.petName, selectedPetId]);

  const handlePetSelect = useCallback((pet) => {
    setSelectedPetId(pet._id);
    setFormData((prev) => ({
      ...prev,
      petName: pet.nome,
      clientName: pet.tutorId?.name || "",
    }));
    setSearchResults([]);
  }, []);

  const handleStatusChange = useCallback((statusValue) => {
    setFormData((prev) => ({ ...prev, status: statusValue }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const isEditing = !!appointmentToEdit?._id;
    if (!selectedPetId) {
      setError("Por favor, selecione um Pet válido da lista de sugestões.");
      setIsSaving(false);
      return;
    }

    const providerIdValid =
      providerId && providerId !== "null" && providerId !== "";
    if (!isEditing && !providerIdValid) {
      setError("Erro: O ID do prestador não foi carregado.");
      setIsSaving(false);
      return;
    }

    const payload = {
      pet: selectedPetId,
      dateTime: new Date(`${formData.date}T${formData.time}:00`).toISOString(),
      duration: DURATION_MAP[formData.duration],
      reason: formData.serviceType,
      notes: formData.notes,
      status: STATUS_MAP[formData.status] || "scheduled",
      email: formData.email,
      phone: formData.phone,
    };

    try {
      if (isEditing) {
        await updateAppointment(appointmentToEdit._id, payload);
      } else {
        const createPayload = { ...payload, provider: providerId };
        await createAppointment(createPayload, providerId);
      }
      onAppointmentSaved?.();
      onClose?.();
    } catch (err) {
      console.error("Erro ao salvar agendamento:", err);
      setError("Falha ao salvar o agendamento.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!appointmentToEdit?._id) return;

    if (
      !window.confirm(
        "Tem certeza de que deseja excluir este agendamento? Esta ação é irreversível."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await deleteAppointment(appointmentToEdit._id);
      onAppointmentSaved?.();
      onClose?.();
    } catch (err) {
      console.error("Erro ao excluir agendamento:", err);
      setError("Falha ao excluir o agendamento.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const isEditing = !!appointmentToEdit;
  const isNewAppointment = !isEditing;
  const isProviderDataReady = !!providerId && !isLoadingProvider;
  const isAwaitingProviderId = isNewAppointment && isLoadingProvider;
  const isProviderMissing =
    isNewAppointment && !providerId && !isLoadingProvider;
  const shouldDisableSaveButton =
    isSaving || isDeleting || (isNewAppointment && !isProviderDataReady);
  const shouldDisableDeleteButton = isSaving || isDeleting;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-[#A8E6CF] z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? "Editar Agendamento" : "Novo Agendamento"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-gray-600 hover:text-gray-900"
          >
            <VscClose className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded font-medium">
              {error}
            </div>
          )}

          {isProviderMissing && (
            <div className="p-3 bg-red-100 text-red-700 rounded font-medium">
              Erro: O ID do Prestador não foi carregado.
              <a
                href="#"
                onClick={() => window.location.reload()}
                className="font-bold underline"
              >
                Recarregue a página
              </a>
              ou certifique-se de ter um perfil de prestador criado.
            </div>
          )}

          <Section
            title="Informações do Cliente"
            icon={VscPerson}
            color="text-[#F0F0F0]"
            className="bg-[#058789]"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="Nome do Pet"
                  icon={MdOutlinePets}
                  placeholder="Busque o nome do Pet..."
                  name="petName"
                  value={formData.petName}
                  onChange={handleChange}
                  autoComplete="off"
                />

                {(isSearching || searchResults.length > 0) && (
                  <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {isSearching && (
                      <div className="p-2 text-gray-500">Buscando...</div>
                    )}

                    {!isSearching &&
                      searchResults.length === 0 &&
                      formData.petName.length > 2 && (
                        <div className="p-2 text-gray-500">
                          Pet não encontrado.
                        </div>
                      )}

                    {searchResults.map((pet) => (
                      <div
                        key={pet._id}
                        className="p-2 cursor-pointer hover:bg-teal-100"
                        onClick={() => handlePetSelect(pet)}
                      >
                        {pet.nome} ({pet.especie}) - Tutor:
                        {pet.tutorId.name}
                      </div>
                    ))}
                  </div>
                )}

                {selectedPetId && (
                  <p className="text-xs text-yellow-300 mt-1">
                    Pet selecionado (ID: {selectedPetId.substring(0, 4)}
                    ...)
                  </p>
                )}
              </div>
              <Input
                label="Nome do Tutor"
                icon={VscPerson}
                placeholder="Nome do Tutor (Informação)"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                disabled={selectedPetId ? true : false}
              />
              <Input
                label="Telefone"
                icon={FiPhoneCall}
                placeholder="Telefone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <Input
                label="Email"
                icon={VscMail}
                placeholder="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </Section>

          <Section
            title="Informações do Serviço"
            icon={VscTag}
            color="text-[#F0F0F0]"
            className="bg-[#058789]"
          >
            <Select
              label="Tipo de Serviço"
              options={["Consulta", "Tosa", "Banho", "Vacinação"]}
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
            />
          </Section>

          <Section
            title="Data e Horário"
            icon={MdOutlineWatchLater}
            color="text-[#F0F0F0]"
            className="bg-[#058789]"
          >
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Data"
                placeholder="DD/MM/AAAA"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
              <Select
                label="Horário"
                options={[
                  "08:00",
                  "09:00",
                  "10:00",
                  "11:00",
                  "12:00",
                  "13:00",
                  "14:00",
                  "15:00",
                  "16:00",
                  "17:00",
                  "18:00",
                ]}
                defaultMessage="Selecione o horário..."
                name="time"
                value={formData.time}
                onChange={handleChange}
              />
              <Select
                label="Duração"
                options={["30 min", "60 min", "90 min"]}
                defaultMessage="Selecione a duração..."
                name="duration"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>
          </Section>

          <Section
            title="Status do Agendamento"
            icon={VscInfo}
            color="text-gray-700"
            className="bg-gray-50"
          >
            <StatusRadios
              value={formData.status}
              onChange={handleStatusChange}
            />
          </Section>

          <Section
            title="Observações (opcional)"
            icon={VscInfo}
            color="text-[#F0F0F0]"
            className="bg-[#058789]"
          >
            <TextArea
              placeholder="Informações adicionais sobre o agendamento..."
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </Section>
        </div>

        <div className="p-6 border-t flex justify-between items-center sticky bottom-0 bg-white z-10">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-2 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 transition-colors shadow-md disabled:bg-gray-400 flex items-center"
              disabled={shouldDisableDeleteButton}
            >
              {isDeleting ? (
                <>
                  <VscTrash className="w-5 h-5 mr-2" /> Excluindo...
                </>
              ) : (
                <>
                  <VscTrash className="w-5 h-5 mr-2" /> Excluir
                </>
              )}
            </button>
          )}

          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
              disabled={isSaving || isDeleting || isAwaitingProviderId}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-white font-semibold bg-teal-600 hover:bg-teal-700 transition-colors shadow-md disabled:bg-gray-400"
              disabled={shouldDisableSaveButton}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewAppointmentModal;
