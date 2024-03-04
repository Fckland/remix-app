import { json, type LoaderFunction } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { authenticate } from "~/shopify.server";

export const loader: LoaderFunction = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);

  try {
    const response = await admin.rest.resources.InventoryLevel.all({
      session: session,
      location_ids: "69657067675",
    });

    if (response) {
      console.log("Oka");
      const data = response.data;
      console.log("data: ", data);
      return json({
        inventory: data,
      });
    }
    return null;
  } catch (error) {
    console.log(error);
  }
};

const Inventory = () => {
  const data: any = useActionData();
  console.log("data: ", data);
  return <div>Inventory</div>;
};

export default Inventory;
