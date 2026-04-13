import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

print(os.getenv("EMAIL_USER"))
print(os.getenv("EMAIL_PASS"))
# 🔹 Send email function
def send_email(to_email, subject, body):
    try:
        sender_email = os.getenv("EMAIL_USER")
        app_password = os.getenv("EMAIL_PASS")   # IMPORTANT

        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, app_password)

        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()

        print(f"✅ Email sent to {to_email}")

    except Exception as e:
        print(f"❌ Email failed: {e}")