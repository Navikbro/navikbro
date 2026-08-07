import { adminDb } from "@/lib/firebase/firebase-admin";


export async function getOralMmdPreference(
  uid: string
) {

  const snap =
    await adminDb
      .collection("users")
      .doc(uid)
      .get();


  if (!snap.exists) {

    return {
      oralMmd: null,
    };

  }


  const data =
    snap.data();


  const oralMmd =
    data?.preferences?.oralMmd;


  return {

    oralMmd:
      typeof oralMmd === "string"
        ? oralMmd
        : null,

  };

}




export async function updateOralMmdPreference(
  uid: string,
  oralMmd: string
) {


  await adminDb
    .collection("users")
    .doc(uid)
    .set(
      {
        preferences:{
          oralMmd,
        },
      },
      {
        merge:true,
      }
    );


  return {

    success:true,

    oralMmd,

  };

}