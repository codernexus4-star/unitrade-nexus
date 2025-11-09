from rest_framework.routers import DefaultRouter
from .views import MessageThreadViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'threads', MessageThreadViewSet, basename='messagethread')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = router.urls 