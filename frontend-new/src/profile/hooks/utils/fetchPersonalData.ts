import PlainPersonalDataService from "src/userPreferences/plainPersonalDataService/plainPersonalData.service";

export async function fetchPersonalData(userId: string) {
  const personalData = await PlainPersonalDataService.getInstance().getPlainPersonalData(userId);

  const name = personalData?.data?.name || "Not available";
  const location = personalData?.data?.location || "Not available";
  const school = personalData?.data?.school || "Not available";
  const program = personalData?.data?.program || "Not available";
  const year = personalData?.data?.year || "Not available";

  return {
    name,
    location,
    school,
    program,
    year,
  };
}
