import PlainPersonalDataService from "src/userPreferences/plainPersonalDataService/plainPersonalData.service";

export async function fetchPersonalData(userId: string) {
  const { data } = await PlainPersonalDataService.getInstance().getPlainPersonalData(userId);

  const firstName = data.first_name;
  const lastName = data.last_name;
  const name = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || "Not available";
  const location = data.province || "Not available";
  const school = data.institution_name || "Not available";
  const program = data.programme_name || "Not available";
  const year = data.school_year || "Not available";

  return {
    name,
    location,
    school,
    program,
    year,
  };
}
