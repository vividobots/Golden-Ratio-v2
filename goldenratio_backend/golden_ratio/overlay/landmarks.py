# overlay/landmarks.py

# --- Labels ---
GR_NAMES = [
    'Eye Spacing', 'Right eye width', 'Left eye width',
    'Right start of brow to arc', 'Left start of brow to arc',
    'Right oral corner to face side', 'Left oral corner to face side',
    'Oral center to chin', 'Upper lip width', 'Nose width', 'Forehead width',
    'Chin width'
]

GR_NAMES_2 = [
    'Right eye corner to face edge', 'Left eye corner to face edge',
    'Right eyebrow width', 'Left eyebrow width', 'Nose length',
    'Oral width', 'Nose tip to oral center', 'Lower lip width',
    'Right eye corner to cheekbone', 'Left eye corner to cheekbone',
    'Middle forehead to right face edge', 'Middle forehead to left face edge'
]

SYM_NAMES = [
    'Hairline to centre of eyebrows',
    'Centre of eyebrows to bottom of nose',
    'Bottom of nose to bottom of chin'
]

SYM_NAMES_2 = [
    'Right side to edge of inner eye',
    'Left side to edge of inner eye',
    'Right inner eye',
    'Left inner eye',
    'Between eyes'
]

# --- Coordinate Indices (Consolidated from your l1/l2 files) ---
l1 = [
    {'start': 190, 'end': 414}, 
    {'start': 133, 'end': 226}, 
    {'start': 362, 'end': 446},
    {'start': 107, 'end': 105}, 
    {'start': 336, 'end': 334},
    {'start': 61, 'end': 138},
    {'start': 291, 'end': 367},
    {'start': 13, 'end': 152}, 
    {'start': 0, 'end': 13}, 
    {'start': 129, 'end': 358}, 
    {'start': 9, 'end': 10}, 
    {'start': 176, 'end': 400}, 
]

l2 = [
    {'start': 8, 'end': 1}, 
    {'start': 133, 'end': 143}, 
    {'start': 362, 'end': 372},
    {'start': 107, 'end': 71}, 
    {'start': 336, 'end': 301},
    {'start': 8, 'end': 13},
    {'start': 14, 'end': 17}, 
    {'start': 54, 'end': 151},
    {'start': 151, 'end': 284},
    {'start': 61, 'end': 291}, 
    {'start': 133, 'end': 116}, 
    {'start': 362, 'end': 345},
]

# Indices for Symmetry Calculation (from sym_asym.py)
SYM_INDEX_1 = [151, 195, 18, 143, 265, 468, 473, 6]
SYM_INDEX_2 = [54, 67, 10, 297, 284, 137, 205, 45, 423, 352, 58, 212, 0, 410, 367]

# --- MISSING REFERENCE VALUES (Calculated from Standard Golden Ratio Face) ---
# These match the order of 'l1' and 'l2'.

rft_arr = [
    63.0,  # Eye Spacing
    30.0,  # Right eye width
    30.0,  # Left eye width
    25.0,  # Right start of brow to arc
    25.0,  # Left start of brow to arc
    45.0,  # Right oral corner to face side
    45.0,  # Left oral corner to face side
    40.0,  # Oral center to chin
    50.0,  # Upper lip width
    35.0,  # Nose width
    140.0, # Forehead width
    45.0   # Chin width
]

rft1_arr = [
    20.0,  # Right eye corner to face edge
    20.0,  # Left eye corner to face edge
    55.0,  # Right eyebrow width
    55.0,  # Left eyebrow width
    50.0,  # Nose length
    55.0,  # Oral width
    25.0,  # Nose tip to oral center
    45.0,  # Lower lip width
    60.0,  # Right eye corner to cheekbone
    60.0,  # Left eye corner to cheekbone
    70.0,  # Middle forehead to right face edge
    70.0   # Middle forehead to left face edge
]