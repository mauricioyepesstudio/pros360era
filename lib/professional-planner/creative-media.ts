import {readFile} from "node:fs/promises";
import path from "node:path";
/** Fixed existing brand photography, never a portrait/credential of the current professional. */
export const creativePhotoPaths={
 documents:"public/images/journey/entrepreneurship.jpg",
 business:"public/images/journey/growth.jpg",
 general:"public/images/journey/stability.jpg",
} as const;
export function creativePhotoKey(category:string):keyof typeof creativePhotoPaths{
 return ["IMMIGRATION_DOCUMENT_SUPPORT","NOTARY"].includes(category)?"documents":
 ["BUSINESS_MARKETING","BUSINESS_OPERATIONS"].includes(category)?"business":"general";
}
export async function loadCreativeMedia(category:string){
 const [photo,logo]=await Promise.all([
 readFile(path.join(process.cwd(),creativePhotoPaths[creativePhotoKey(category)])),
 readFile(path.join(process.cwd(),"public/brand/evolusa-primary.png")),
 ]);
 return {photo,logo};
}
