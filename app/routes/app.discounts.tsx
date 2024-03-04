import { json, type ActionFunction } from "@remix-run/node";
import { Form, useActionData, useSubmit } from "@remix-run/react";
import { Button, Card, Page } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

export const action: ActionFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    const startsAt = "2024-03-01T00:00:00Z";
    const endsAt = "2024-03-31T00:00:00Z";
    const minimumRequirementSubtotal = 2;
    const discountAmount = 100;

    const response = await admin.graphql(
      `#graphql
    mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode {
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              codes(first: 10) {
                nodes {
                  code
                }
              }
              startsAt
              endsAt
              customerSelection {
                ... on DiscountCustomerAll {
                  allCustomers
                }
              }
              customerGets {
                value {
                  ... on DiscountPercentage {
                    percentage
                  }
                }
                items {
                  ... on AllDiscountItems {
                    allItems
                  }
                }
              }
              appliesOncePerCustomer
            }
          }
        }
        userErrors {
          field
          code
          message
        }
      }
    }`,
      {
        variables: {
          basicCodeDiscount: {
            title: "100 off all items during the summer of 2022",
            code: "SUMMER100",
            startsAt: startsAt,
            endsAt: endsAt,
            minimumRequirement: {
              subtotal: {
                greaterThanOrEqualToSubtotal: minimumRequirementSubtotal,
              },
            },
            customerSelection: {
              all: true,
            },
            customerGets: {
              value: {
                discountAmount: {
                  amount: discountAmount,
                  appliesOnEachItem: false,
                },
              },
              items: {
                all: true,
              },
            },
            appliesOncePerCustomer: true,
          },
        },
      },
    );

    if (response.ok) {
      const responseJson = await request.json();
      console.log("created discount: ", responseJson);

      return json({
        discount: responseJson.data,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const Discounts = () => {
  const submit = useSubmit();
  const actionData = useActionData();
  console.log("actionData: ", actionData);

  const generateDiscount = () => submit({}, { replace: true, method: "POST" });

  return (
    <Page>
      <Card>
        <Form onSubmit={generateDiscount} method="post">
          <Button submit>Create Discount</Button>
        </Form>
      </Card>
    </Page>
  );
};

export default Discounts;
