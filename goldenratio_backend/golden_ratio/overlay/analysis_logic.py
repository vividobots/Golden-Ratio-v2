import numpy as np
import cv2
from .landmarks import l1, l2, GR_NAMES, GR_NAMES_2, rft_arr, rft1_arr

# --- Helpers ---
def euclidean_distance(p1, p2, scale=3.5):
    dist = np.linalg.norm(np.array(p1) - np.array(p2))
    return dist / scale

def draw_line(image, pt1, pt2, color=(0, 0, 255), thickness=2):
    pt1 = (int(pt1[0]), int(pt1[1]))
    pt2 = (int(pt2[0]), int(pt2[1]))
    cv2.line(image, pt1, pt2, color, thickness)

# --- 1. Golden Ratio Logic (Restored YOUR Original Logic) ---
def calculate_golden_ratio_data(image, landmarks):
    sum1 = 0
    ratios_list = []
    
    # Process L1 (Red Lines)
    # Using zip with rft_arr ensures we have reference values
    for pair, n, name in zip(l1, rft_arr, GR_NAMES):
        try:
            pt1 = landmarks[pair['start']]
            pt2 = landmarks[pair['end']]
            ft = euclidean_distance(pt1, pt2)
            
            # Original Percentage Logic
            v = ft / n if n != 0 else 0
            s1 = v / 1.618
            if v * 100 > 100:
                s1 = 1.618 / v if v != 0 else 0
            
            percentage = s1 * 100
            sum1 += percentage
            
            cv2.line(image, pt1, pt2, (0, 0, 255), 2)
            
            ratios_list.append({
                'Name': name,
                'patient_value': f"{ft:.3f}",
                'reference_value': f"{n:.3f}",
                'gr_percentage': f"{percentage:.3f}"
            })
        except IndexError:
            continue

    # Process L2 (Green Lines)
    for pair, r, name2 in zip(l2, rft1_arr, GR_NAMES_2):
        try:
            pt1 = landmarks[pair['start']]
            pt2 = landmarks[pair['end']]
            ft1 = euclidean_distance(pt1, pt2)
            
            c = r / 1.618
            s = ft1 / c if c != 0 else 0
            s1 = s / 1.618
            if s1 * 100 > 100:
                s1 = 1.618 / s if s != 0 else 0
                
            percentage = s1 * 100
            sum1 += percentage
            
            cv2.line(image, pt1, pt2, (0, 255, 0), 2)
            
            ratios_list.append({
                'Name': name2,
                'patient_value': f"{ft1:.3f}",
                'reference_value': f"{r:.3f}",
                'gr_percentage': f"{percentage:.3f}"
            })
        except IndexError:
            continue

    total_items = len(ratios_list)
    avg = sum1 / total_items if total_items > 0 else 0
    return image, ratios_list, avg

# --- 2. Input As Reference (Restored Original Logic) ---
def calculate_input_as_reference(image, landmarks):
    ratios = []
    vals1 = []
    vals2 = []
    
    # Calculate L1 (Input)
    for pair in l1:
        pt1 = landmarks[pair['start']]
        pt2 = landmarks[pair['end']]
        vals1.append(euclidean_distance(pt1, pt2))
        cv2.line(image, pt1, pt2, (0, 0, 255), 2)

    # Calculate L2 (Reference)
    for pair in l2:
        pt1 = landmarks[pair['start']]
        pt2 = landmarks[pair['end']]
        vals2.append(euclidean_distance(pt1, pt2))
        cv2.line(image, pt1, pt2, (0, 255, 0), 2)

    # Compare
    percentages = []
    for v1, v2, n1, n2 in zip(vals1, vals2, GR_NAMES, GR_NAMES_2):
        p = v1 * 1.618
        q = p / v2 if v2 != 0 else 0
        if q * 100 > 100:
            q = v2 / p if p != 0 else 0
        
        perc = q * 100
        percentages.append(perc)
        ratios.append({
            'Name': n1,
            'Description2': n2,
            'dist1': f"{v1:.3f}",
            'dist2': f"{v2:.3f}",
            'Percentage': f"{perc:.3f}"
        })

    avg = sum(percentages) / len(percentages) if percentages else 0
    return image, ratios, avg

# --- 3. Symmetry Logic (Simplified for stability) ---

def calculate_symmetry(image, landmarks):
    results = []
    # scores = []
    
    # 1. Calculate Midline
    try:
        top = np.array(landmarks[10]) # Forehead
        chin = np.array(landmarks[152]) # Chin
        mid_x = int((top[0] + chin[0]) / 2)
    except:
        mid_x = image.shape[1] // 2

    # Define Symmetry Pairs (Left Index, Right Index, Name)
    # These match typical MediaPipe indices for symmetry
    sym_pairs = [
        (33, 263, 'Outer Eye Corners'),
        (133, 362, 'Inner Eye Corners'),
        (159, 386, 'Upper Eyelids'),
        (145, 374, 'Lower Eyelids'),
        (61, 291, 'Mouth Corners'),
        (127, 356, 'Cheekbones'),
        (234, 454, 'Face Width at Ears'),
        (54, 284, 'Jawline'),
        (10, 152, 'Vertical Midline (Chin to Forehead)') # Special case
    ]
    
    # Create Images
    img_prop = image.copy() # Proportions (Lines)
    img_uni = image.copy()  # Unified (Dots)
    img_lines = image.copy() # Detailed (Grid)
    
    # Draw Center Line
    cv2.line(img_lines, (int(mid_x), 0), (int(mid_x), image.shape[0]), (255, 0, 0), 2)

    # Calculate Deviations
    for (idx1, idx2, name) in sym_pairs:
        try:
            pt1 = landmarks[idx1]
            pt2 = landmarks[idx2]
            
            # Draw Connections
            draw_line(img_prop, pt1, pt2, (0, 255, 255)) # Yellow
            draw_line(img_lines, pt1, pt2, (0, 255, 0)) # Green
            
            # Calculate Deviation
            dist_l = abs(pt1[0] - mid_x)
            dist_r = abs(pt2[0] - mid_x)
            diff = abs(dist_l - dist_r)
            avg_width = (dist_l + dist_r) / 2
            
            score = 100 - ((diff / avg_width) * 100) if avg_width > 0 else 0
            # Cap score 0-100
            score = max(0, min(100, score))
            
            label = "Balanced" if score > 90 else "Asymmetric"
            
            results.append({
                'Name': name,
                'Distance': f"L:{dist_l:.1f} / R:{dist_r:.1f}",
                'Symmetry': label,
                'Percentage': f"{score:.2f}"
            })
            
            # Draw Unified (Mirror Points)
            target_r = int(mid_x + (mid_x - pt1[0]))
            cv2.circle(img_uni, (target_r, pt1[1]), 3, (0, 0, 255), -1)
            cv2.circle(img_uni, pt2, 3, (255, 0, 0), -1)
            
        except Exception as e:
            continue

    # RETURN EXACTLY 4 VALUES
    return img_prop, img_uni, img_lines, results

def calculate_phi_matrix(image, landmarks):
    ratios = []
    percs = []
    
    # Specific Phi Matrix Pairs (A vs B)
    # The goal is to see if A/B == 1.618
    phi_comparisons = [
        (168, 5, 5, 2, "Eye-Nose Bridge", "Nose Bridge-Tip"), # Vertical Nose Proportions
        (168, 2, 2, 17, "Forehead-Nose", "Nose-Chin"),       # Facial Thirds
        (33, 263, 61, 291, "Outer Eye Width", "Mouth Width"), # Horizontal Proportions
        (0, 17, 17, 152, "Upper Lip Height", "Chin Height"),
        (133, 362, 2, 94, "Inner Eye Dist", "Nose Width")
    ]
    
    img_phi = image.copy()

    for (i1, i2, i3, i4, name1, name2) in phi_comparisons:
        try:
            pt1, pt2 = landmarks[i1], landmarks[i2]
            pt3, pt4 = landmarks[i3], landmarks[i4]
            
            d1 = euclidean_distance(pt1, pt2)
            d2 = euclidean_distance(pt3, pt4)
            
            # Calculate Ratio
            actual_ratio = d1 / d2 if d2 != 0 else 0
            ideal = 1.618
            
            # How close is it to Phi (1.618)?
            # Percentage = (Actual / Ideal) * 100 or (Ideal / Actual) * 100
            if actual_ratio > ideal:
                score = (ideal / actual_ratio) * 100
            else:
                score = (actual_ratio / ideal) * 100
                
            percs.append(score)
            
            ratios.append({
                'Description1': f"{name1} ({d1:.1f})",
                'Description2': f"{name2} ({d2:.1f})",
                'dist1': f"{actual_ratio:.3f}",
                'dist2': "1.618",
                'Percentage': f"{score:.2f}"
            })
            
            # Draw Lines
            # cv2.line(img_phi, pt1, pt2, (255, 0, 0), 2) # Blue for Num
            # cv2.line(img_phi, pt3, pt4, (0, 255, 255), 2) # Yellow for Denom
            draw_line(img_phi, pt1, pt2, (255, 0, 0), 2) 
            draw_line(img_phi, pt3, pt4, (0, 255, 255), 2)
            
        except IndexError:
            continue

    avg = sum(percs) / len(percs) if percs else 0
    return img_phi, ratios, avg

# --- 5. SHRINK & BULGE (Ported from 'golden_face_analyzer.py') ---
# This is the "Region-Weighted Deformation" method from your reference file.

def apply_region_weighted_deformation(img, landmarks_xy, mode="shrink", strength=0.20):
    """
    Apply region-weighted deformation (realistic shrink/bulge).
    Ported from golden_face_analyzer.py
    """
    h, w = img.shape[:2]
    pts = np.array(landmarks_xy, dtype=np.float32)
    
    # Calculate Face Center
    cx = np.mean(pts[:, 0])
    cy = np.mean(pts[:, 1])

    # build dense displacement field
    grid_x, grid_y = np.meshgrid(np.arange(w), np.arange(h))
    
    # We cast to float32 immediately to avoid type errors
    grid_x = grid_x.astype(np.float32)
    grid_y = grid_y.astype(np.float32)
    
    dx = np.zeros_like(grid_x, dtype=np.float32)
    
    # smooth radial weight based on distance from center
    # dist_x is normalized deviation from center X
    dist_x = (grid_x - cx) / w
    dist_r = np.abs(dist_x)
    
    # Decay from centerline outward
    weight = np.exp(-dist_r * 8.0) 

    # determine direction
    # Shrink (-1) pulls pixels IN towards center
    # Bulge (1) pushes pixels OUT from center
    direction = -1 if mode == "shrink" else 1
    
    # Vertical falloff (less warp near forehead/chin, more at nose/eyes)
    dist_y = np.abs((grid_y - cy) / h)
    falloff_y = np.exp(-dist_y * 5.0)
    
    # Calculate displacement
    dx = direction * strength * weight * (grid_x - cx) * falloff_y

    # remap coordinates
    map_x = np.clip(grid_x - dx, 0, w - 1).astype(np.float32)
    map_y = grid_y # Y coordinates stay the same (horizontal warp only)

    # Apply warp
    warped = cv2.remap(img, map_x, map_y, cv2.INTER_LINEAR)
    return warped

def generate_shrink_bulge_maps(img, landmarks):
    # Using specific strengths from your reference code
    # Strength 0.25 gives a noticeable effect without breaking the image
    shrink_img = apply_region_weighted_deformation(img, landmarks, mode="shrink", strength=0.25)
    bulge_img = apply_region_weighted_deformation(img, landmarks, mode="bulge", strength=0.25)
    
    return shrink_img, bulge_img