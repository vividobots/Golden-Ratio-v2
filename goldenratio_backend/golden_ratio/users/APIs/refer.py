# import os
# import json
# import mediapipe as mp
# import numpy as np

# from .landmarks import l1
# from .landmarks2 import l2
# from PIL import Image
# import cv2
# import pandas as pd

# # Define paths and filenames
# folder_path = 'D:/Software_Projects/Git Clone Repository 4/goldenratio_backend/reference_images/'
# # folder_path1='C:/Users/user/PycharmProjects/goldebn ratio/PycharmProjects/pythonProject/golden ratio'


# # Define landmark filter with two pairs
# filter_landmark3 =l1


# filter_landmark4= l2
# mp_face_mesh = mp.solutions.face_mesh
# #face_mesh = mp_face_mesh.FaceMesh()
# face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)

# # Function to apply a filter to the detected landmarks

# rft_arr = []
# rft1_arr = []
# rdis = []
# rdis1 = []

# #print(l1[0])
# #value1
# def rdraw_lines_with_text(image, landmarks, landmark_pairs):
#     reference_real_world_size = 3.5
#     for pair in landmark_pairs:
#         start_idx = pair['start']
#         end_idx = pair['end']
#         #label = pair['label']

#         start_pt = tuple(map(int,landmarks[start_idx]))
#         end_pt = tuple(map(int,landmarks[end_idx]))
#         distance = np.linalg.norm(np.array(start_pt) - np.array(end_pt))/reference_real_world_size
#         dis=str(distance)
#         rft = round(distance, 3)
#         rft_arr.append(rft)
#         rdis.append(rft)
#         #print(f"Distance from {start_idx} to {end_idx}: {rft}mm")
#        # print(v * 100)

#         #Draw the line
#         cv2.line(image, start_pt, end_pt, (0, 0, 255, 0), 2)

#         # Calculate the midpoint
#         midpoint = ((start_pt[0] + end_pt[0]) // 2, (start_pt[1] + end_pt[1]) // 2)

#         # Adjust the position of the text to be above the line
#         text_position = (midpoint[0], midpoint[1] - 10)

#         #Annotate with the label
#         #cv2.putText(image, label, text_position, cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

#     return rdis
# # value 1.618
# def rdraw_lines_with_text1(image, landmarks, landmark_pairs):
#     reference_real_world_size = 3.5
#     for pair in landmark_pairs:
#         start_idx = pair['start']
#         end_idx = pair['end']
#         #label = pair['label']
#         start_pt =tuple(map(int, landmarks[start_idx]))
#         end_pt = tuple(map(int,landmarks[end_idx]))
#         distance = np.linalg.norm(np.array(start_pt) - np.array(end_pt))/reference_real_world_size
#         dis=str(distance)
#         rft1 = float(dis[0:3])
#         rft1_arr.append(rft1)
#         rdis1.append(rft1)
#         #print(f"Distance from {start_idx} to {end_idx}: {rft1}mm")
#         #(s * 100)


#         #Draw the line
#         cv2.line(image, tuple(start_pt), tuple(end_pt), (0, 255, 0), 2)

#         # Calculate the midpoint
#         midpoint = ((start_pt[0] + end_pt[0]) // 2, (start_pt[1] + end_pt[1]) // 2)

#         # Adjust the position of the text to be above the line
#         text_position = (midpoint[0], midpoint[1] - 10)

#         #Annotate with the label
#         #cv2.putText(image, label, text_position, cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

#     return rdis1

# def apply_filter(image, landmarks, landmark_indices):
#     # Draw circles around the specified landmark indices
#     for idx in landmark_indices:
#         landmark_pt = landmarks[idx]
#         cv2.circle(image, landmark_pt, 3, (0, 255, 0), -1)
#     # for idx in landmark_indices1:
#     #     landmark_pt = landmarks[idx]
#     #     cv2.circle(image, landmark_pt, 3, (0,0, 255, 0), -1)
#     return image


# # Load the input image
# image_path = os.path.join(folder_path, "aj2.jpg")
# print("123---->",image_path)

# image = cv2.imread(image_path)
# print(image)
# if image is None:
#     raise FileNotFoundError(f"Failed to load image from: {image_path}")

# image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

# # Process the image with MediaPipe face mesh
# results = face_mesh.process(image_rgb)
# if results.multi_face_landmarks:
#     for face_landmarks in results.multi_face_landmarks:
#         # Convert normalized landmarks to pixel coordinates
#         height, width, _ = image.shape
#         l= []
#         landmarks = [(int(landmark.x * width),int(landmark.y * height)) for landmark in face_landmarks.landmark]

#         # Apply filter to the detected landmarks using filter_landmark indices
#         landmark_indices = [lm['start'] for lm in filter_landmark3] + [lm['end'] for lm in filter_landmark3]
#         image = apply_filter(image, landmarks, landmark_indices)
#         landmark_indices1 = [lm['start'] for lm in filter_landmark4] + [lm['end'] for lm in filter_landmark4]
#         image1 = apply_filter(image, landmarks, landmark_indices1)

#         rdis = rdraw_lines_with_text(image, landmarks, filter_landmark3)
#         rdis1 = rdraw_lines_with_text1(image1, landmarks, filter_landmark4)
#         # Draw circles around all landmarks (for debugging purposes)
#         # for landmark_pt in landmarks:
#         #     cv2.circle(image,tuple(map(int, landmark_pt)), 1, (255, 0, 0), -1)  # Draw a small dot for each landmark

# print(rft_arr)
# print(rft1_arr)
#     # print("________________________________________________________________________________________________")
# # print(rft1_arr)
# dfrft=pd.DataFrame(rft_arr)
# dfrft1=pd.DataFrame(rft1_arr)
# dfrft.to_csv("l1.csv")
# dfrft1.to_csv("l2.csv")


# #from landmarks2 import l2 as nl2
# # for i in range(0,len(filter_landmark3)):

# #     tempdict = face_landmarks[i]
# #     tempdict["refval"] = rft_arr[i]
# #     face_landmarks[i] = tempdict


# # #from landmarks2 import l2 as nl2
# # for j in range(0,len(filter_landmark4)):
# #     tempdist1 = filter_landmark4[j]
# #     tempdist1["refval"] = rft1_arr[j]
# #     filter_landmark4[j] = tempdist1


# #print(l1)
# output_path = os.path.join(folder_path, 'input_marked_image.jpg')
# cv2.imwrite(output_path, image)
# # Display the modified image
# #cv2.imshow("Filtered_Image", image)
# #cv2.imshow("Filtered_Image", image1)

# cv2.waitKey(0)
# cv2.destroyAllWindows()





import os
import math
import cv2
import numpy as np
import mediapipe as mp
from django.http import JsonResponse, HttpResponseNotFound
from django.conf import settings
from django.views.decorators.http import require_GET
from django.shortcuts import get_object_or_404
from users.models import UploadedImage          # adjust import if models in other module
from .landmarks import l1                   # your landmark pair definitions
from .landmarks2 import l2                  # second set (if named differently, adjust)

# Ensure processed output folder exists under MEDIA_ROOT
PROCESSED_SUBDIR = "processed"
PROCESSED_DIR = os.path.join(settings.MEDIA_ROOT, PROCESSED_SUBDIR)
os.makedirs(PROCESSED_DIR, exist_ok=True)

rft_arr = []
rft1_arr = []


def _euclidean_distance(p1, p2, scale=3.5):
    """Compute Euclidean distance between two (x,y) pixel coordinates and scale it."""
    x1, y1 = p1
    x2, y2 = p2
    dx = x2 - x1
    dy = y2 - y1
    dist_pixels = math.hypot(dx, dy)
    return round(float(dist_pixels) / float(scale), 3)

def _safe_get_label(pair, default):
    """Return label from pair dict if present, otherwise default string."""
    try:
        return pair.get("label") or pair.get("name") or default
    except Exception:
        return default

@require_GET
def inpt_json(request, id):
    """
    Endpoint: /uploadfile/inpt_json/<id>/
    - Looks up UploadedImage by id (adjust if you use different model/key)
    - Processes the image with MediaPipe FaceMesh
    - Computes distances for filter sets l1 and l2
    - Builds measurements array: Name, dist1, dist2, ref1, ref2, Percentage
    - Returns JSON: [measurements, [{"average1": avg}], [{"output_image": full_url}]]
    """
    # Find UploadedImage instance (adapt if your model is different)
    try:
        uploaded = get_object_or_404(UploadedImage, id=id)
    except Exception:
        return HttpResponseNotFound("UploadedImage not found")

    # Path to original uploaded image file
    # If your model stores file path differently, adapt here; typical: uploaded.file_upload.path
    image_path = getattr(uploaded, "file_upload", None)
    if not image_path:
        return JsonResponse([[], [{"average1": 0}], [{"output_image": ""}]], safe=False)

    # image_path may be an ImageFieldFile; get filesystem path
    if hasattr(image_path, "path"):
        img_fs_path = image_path.path
    else:
        img_fs_path = str(image_path)  # fallback: string path

    if not os.path.exists(img_fs_path):
        return HttpResponseNotFound("Image file not found on disk")

    # Read image
    image_bgr = cv2.imread(img_fs_path)
    if image_bgr is None:
        return HttpResponseNotFound("Unable to read image")

    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    height, width, _ = image_bgr.shape

    # Prepare MediaPipe FaceMesh
    mp_face_mesh = mp.solutions.face_mesh
    # Using refine_landmarks=True if you want iris/extra landmarks; adjust as needed
    with mp_face_mesh.FaceMesh(static_image_mode=True, refine_landmarks=True) as face_mesh:
        results = face_mesh.process(image_rgb)

    if not results.multi_face_landmarks:
        # No face detected — return structured empty response
        return JsonResponse([[], [{"average1": 0}], [{"output_image": ""}]], safe=False)

    # Only process the first detected face
    face_landmarks = results.multi_face_landmarks[0]
    landmarks = [(int(landmark.x * width), int(landmark.y * height)) for landmark in face_landmarks.landmark]

    # Prepare arrays for distances
    # We'll compute rft_arr from l1 and rft1_arr from l2
    rft_arr = []
    rft1_arr = []

    # draw lines on a copy for the output image
    annotated = image_bgr.copy()

    # Compute distances for l1
    for idx, pair in enumerate(l1):
        start_idx = pair["start"]
        end_idx = pair["end"]
        # ensure indices inside range
        if start_idx >= len(landmarks) or end_idx >= len(landmarks):
            rft_arr.append(None)
            continue
        start_pt = tuple(map(int, landmarks[start_idx]))
        end_pt = tuple(map(int, landmarks[end_idx]))
        dist_mm = _euclidean_distance(start_pt, end_pt, scale=3.5)  # scale 3.5 (your factor)
        rft_arr.append(dist_mm)

        # draw the line and label (optional)
        cv2.line(annotated, start_pt, end_pt, (0, 0, 255), 2)
        midpoint = ((start_pt[0] + end_pt[0]) // 2, (start_pt[1] + end_pt[1]) // 2)
        cv2.putText(annotated, f"{dist_mm:.3f}", midpoint, cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0,0,255), 1)

    # Compute distances for l2
    for idx, pair in enumerate(l2):
        start_idx = pair["start"]
        end_idx = pair["end"]
        if start_idx >= len(landmarks) or end_idx >= len(landmarks):
            rft1_arr.append(None)
            continue
        start_pt = tuple(map(int, landmarks[start_idx]))
        end_pt = tuple(map(int, landmarks[end_idx]))
        dist_mm = _euclidean_distance(start_pt, end_pt, scale=3.5)
        rft1_arr.append(dist_mm)

        # draw the line and label
        cv2.line(annotated, start_pt, end_pt, (0, 255, 0), 2)
        midpoint = ((start_pt[0] + end_pt[0]) // 2, (start_pt[1] + end_pt[1]) // 2)
        cv2.putText(annotated, f"{dist_mm:.3f}", midpoint, cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0,255,0), 1)

    # Build measurements list: match by index. Use labels from pairs if present
    max_len = max(len(l1), len(l2))
    measurements = []
    percentages = []
    for i in range(max_len):
        name = None
        # try to pick a name consistently: prefer l1 label when available
        if i < len(l1):
            name = _safe_get_label(l1[i], f"l1_pair_{i}")
        elif i < len(l2):
            name = _safe_get_label(l2[i], f"l2_pair_{i}")
        else:
            name = f"pair_{i}"

        dist1 = rft_arr[i] if i < len(rft_arr) else None
        dist2 = rft1_arr[i] if i < len(rft1_arr) else None

        # We compute a normalized percentage: (smaller / larger) * 100, capped at 100
        percentage_val = None
        if (dist1 is not None) and (dist2 is not None) and dist1 > 0 and dist2 > 0:
            smaller = min(dist1, dist2)
            larger = max(dist1, dist2)
            percentage_val = round(min((smaller / larger) * 100.0, 100.0), 3)
            percentages.append(percentage_val)

        measurements.append({
            "Name": name,
            "dist1": dist1,
            "dist2": dist2,
            "ref1": None,          # If you have an external reference value, set here
            "ref2": None,
            "Percentage": percentage_val
        })

    # Compute average percentage (if any)
    avg = round(sum(percentages) / len(percentages), 3) if percentages else 0.0

    # Save annotated output image into MEDIA_ROOT/processed
    out_filename = f"processed_{id}.jpg"
    out_fs_path = os.path.join(PROCESSED_DIR, out_filename)
    cv2.imwrite(out_fs_path, annotated)

    # Build absolute URL for frontend to fetch
    # Ensure MEDIA_URL ends with slash; request.build_absolute_uri handles host + path.
    relative_url = os.path.join(settings.MEDIA_URL.rstrip('/'), PROCESSED_SUBDIR, out_filename)
    output_full_url = request.build_absolute_uri(relative_url)

    # Return JSON in the format frontend expects
    return JsonResponse([measurements, [{"average1": avg}], [{"output_image": output_full_url}]], safe=False)
