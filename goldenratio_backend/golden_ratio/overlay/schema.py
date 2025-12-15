import graphene
from graphene_django import DjangoObjectType
from .models import ProcessedImage
from graphql import GraphQLError
import base64

class ProcessedImageType(DjangoObjectType):
    class Meta:
        model = ProcessedImage
        fields = ("id", "original_image", "shrink_image", "bulge_image", "asym_mask", "created_at")

class Query(graphene.ObjectType):
    processed_image = graphene.Field(ProcessedImageType, id=graphene.String(required=True))

    processed_image_by_user = graphene.List(ProcessedImageType, user_id=graphene.String(required=True))

    def resolve_processed_image(self, info, id):
        try:
            return ProcessedImage.objects.get(id=id)
        except ProcessedImage.DoesNotExist:
            return None

    def resolve_processed_image_by_user(self, info, user_id):
        # --- CRITICAL FIX: DECODE BEFORE QUERYING ---
        
        # If user_id is NOT a simple number (e.g. "1"), try to decode it
        if isinstance(user_id, str) and not user_id.isdigit():
            try:
                # Attempt Base64 decode (e.g., 'VXNlck5vZGU6MQ==')
                decoded_bytes = base64.b64decode(user_id)
                decoded_str = decoded_bytes.decode('utf-8')
                
                # If it looks like "UserNode:1", grab the "1"
                if ":" in decoded_str:
                    user_id = decoded_str.split(':')[1]
            except Exception:
                # If decoding fails, we just keep the original value 
                # and let the DB query handle (or fail gracefully) later
                pass

        # NOW it is safe to query the database because user_id is likely "1"
        return ProcessedImage.objects.filter(user__id=user_id).order_by('-created_at')
        