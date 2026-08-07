import { adminFetch } from "@/lib/authentication/adminFetch";


interface OralMmdPreferenceResponse {
  oralMmd: string | null;
}


interface UpdateOralMmdResponse {
  success: boolean;
  oralMmd: string;
}



export async function fetchOralMmdPreference(): Promise<OralMmdPreferenceResponse> {

  const res = await adminFetch(
    "/api/user-preference/oral-mmd"
  );


  return res.json();

}




export async function updateOralMmdPreference(
  oralMmd: string
): Promise<UpdateOralMmdResponse> {


  const res = await adminFetch(
    "/api/user-preference/oral-mmd",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        oralMmd,
      }),

    }
  );


  return res.json();

}