import { renderEmail } from "./emailRender.service";
import { publishEmailJob } from "./emailPublisher.service";
import { createModuleLogger } from "../utils/logger";

const log = createModuleLogger(import.meta.url);

export interface UserInviteEmailData {
  name: string;
  email: string;
  password: string;
  role: string;
  loginUrl?: string;
}

export async function sendUserInviteEmail(
  data: UserInviteEmailData,
): Promise<void> {
  log.info(`Sending user invite email to: ${data.email}`);

  const templateData = {
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
    loginUrl: data.loginUrl ?? `${process.env.APP_URL ?? "http://localhost:3000"}/login`,
  };

  const html = await renderEmail({
    templateName: "userInviteEmailTemplate.mjml",
    data: templateData,
  });

  await publishEmailJob({
    to: data.email,
    subject: "Welcome to Transit Ops — Your Account is Ready",
    html,
  });

  log.info(`User invite email job enqueued for: ${data.email}`);
}
