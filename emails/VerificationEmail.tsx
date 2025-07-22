import { brand_name } from "@/utils/constants";
import {
  Font,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

export default function VerificationCodeEmail({
  username,
  otp,
}: {
  username: string;
  otp: string;
}) {
  return (
    <>
      <Html>
        <Head>
          <title>Verification Code | {brand_name}</title>
          <Font
            fontFamily="Roboto"
            fallbackFontFamily="Verdana"
            webFont={{
              url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
              format: "woff2",
            }}
            fontWeight={400}
            fontStyle="normal"
          />
        </Head>
        <Preview>Here&apos;s your varification code: {otp}</Preview>
        <Section>
          <Row>
            <Heading as="h2">Hello {username},</Heading>
          </Row>
          <Row>
            <Text>
              Thank you for registering to {brand_name}. Please use the below
              otp to verify your email
            </Text>
          </Row>
          <Row>
            <Text>{otp}</Text>
          </Row>
          <Row>
            <Text>If this is not you. Please ignore the email</Text>
          </Row>
        </Section>
      </Html>
    </>
  );
}
