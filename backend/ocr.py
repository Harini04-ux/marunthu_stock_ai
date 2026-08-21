import cv2
import os
import re
import pytesseract


# ============================================================
# OCR TEXT EXTRACTION
# Lightweight OCR for Render deployment
# ============================================================

def preprocess_image(image_path):

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError("Unable to read image")

    # Convert to grayscale
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # Resize for better OCR
    height, width = gray.shape

    if width < 1200:
        scale = 2
        gray = cv2.resize(
            gray,
            (width * scale, height * scale),
            interpolation=cv2.INTER_CUBIC
        )

    # Denoise
    gray = cv2.GaussianBlur(
        gray,
        (3, 3),
        0
    )

    # Threshold
    threshold = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]

    return threshold


# ============================================================
# OCR
# ============================================================

def extract_text(image_path):

    if not os.path.exists(image_path):
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    image = preprocess_image(
        image_path
    )

    try:

        text = pytesseract.image_to_string(
            image,
            config="--psm 6"
        )

    except Exception as e:

        raise RuntimeError(
            f"OCR failed: {str(e)}"
        )

    # Clean text
    lines = []

    for line in text.splitlines():

        cleaned = re.sub(
            r"\s+",
            " ",
            line
        ).strip()

        if cleaned:
            lines.append(cleaned)

    return "\n".join(lines)
