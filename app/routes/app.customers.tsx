import { json, type ActionFunction } from "@remix-run/node";
import { Form, useActionData, useSubmit } from "@remix-run/react";
import { Button, Card, Page, TextField } from "@shopify/polaris";
import { useState } from "react";
import { createCustomer } from "~/api/prisma.server";
import { authenticate } from "~/shopify.server";

export const action: ActionFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();

  const email = formData.get("email");
  const name = formData.get("name");
  console.log(email, name);

  try {
    const response = await admin.graphql(
      `#graphql
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          userErrors {
            field
            message
          }
          customer {
            id
            email
            phone
            firstName
            lastName
            smsMarketingConsent {
              marketingState
              marketingOptInLevel
            }
            addresses {
              address1
              city
              country
              phone
              zip
            }
          }
        }
      }`,
      {
        variables: {
          input: {
            email: email,
            phone: "+13022765434",
            firstName: name,
            lastName: "Messi",
            addresses: [
              {
                address1: "915 BRICKELL BAY DR",
                city: "Miami",
                province: "FL",
                phone: "1232211030",
                zip: "33131",
                lastName: "Messi",
                firstName: name,
                country: "USA",
              },
            ],
          },
        },
      },
    );

    if (response.ok) {
      console.log("hit");
      const data = await response.json();
      console.log(data);

      await createCustomer({
        email: email,
        name: name,
      })

      return json({ data: data.data });
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const Customers = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const submit = useSubmit();
  const actionData = useActionData<typeof action>();
  console.log(actionData);

  const generateCustomer = () => submit({}, { replace: true, method: "POST" });

  return (
    <Page>
      <Card>
        <Form onSubmit={generateCustomer} method="post">
          <TextField
            id="name"
            name="name"
            label="name"
            autoComplete="off"
            value={name}
            onChange={(value) => setName(value)}
          ></TextField>
          <TextField
            id="email"
            name="email"
            label="email"
            autoComplete="off"
            value={email}
            onChange={(value) => setEmail(value)}
          ></TextField>
          <Button submit>Create Customer</Button>
        </Form>
      </Card>
    </Page>
  );
};

export default Customers;
