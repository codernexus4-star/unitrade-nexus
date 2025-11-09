from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from .sms_utils import send_registration_sms

@receiver(post_save, sender=User)
def send_welcome_sms(sender, instance, created, **kwargs):
    if created and instance.phone_number:
        try:
            send_registration_sms(instance.phone_number, instance.first_name)
        except Exception as e:
            # Optionally log the error
            print(f"Failed to send registration SMS: {e}") 