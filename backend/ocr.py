import easyocr
import re
import cv2
import os
import numpy as np

# ============================================================
# EASY OCR READER
# ============================================================

reader = easyocr.Reader(
    ["en"],
    gpu=False
)


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

def preprocess_variants(image_path):

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError("Unable to read image")

    variants = []

    # Original
    variants.append(("original", image))

    # Grayscale
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    variants.append(("gray", gray))

    # Resize - OCR works better on larger text
    height, width = gray.shape

    scale = 2

    resized = cv2.resize(
        gray,
        (width * scale, height * scale),
        interpolation=cv2.INTER_CUBIC
    )

    variants.append(("resized", resized))

    # Denoise
    denoised = cv2.fastNlMeansDenoising(
        resized,
        None,
        10,
        7,
        21
    )

    variants.append(("denoised", denoised))

    # Contrast
    contrast = cv2.equalizeHist(
        denoised
    )

    variants.append(("contrast", contrast))

    # OTSU threshold
    _, threshold = cv2.threshold(
        contrast,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    variants.append(("threshold", threshold))

    # Adaptive threshold
    adaptive = cv2.adaptiveThreshold(
        contrast,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11
    )

    variants.append(("adaptive", adaptive))

    return variants


# ============================================================
# OCR
# ============================================================

def extract_text(image_path):

    if not os.path.exists(image_path):
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    variants = preprocess_variants(
        image_path
    )

    all_text = []

    for name, image in variants:

        try:

            result = reader.readtext(
                image,
                detail=1,
                paragraph=False,
                mag_ratio=1.5
            )

            for item in result:

                if len(item) >= 3:

                    text = str(item[1]).strip()
                    confidence = float(item[2])

                    if text and confidence >= 0.15:

                        all_text.append(
                            text
                        )

        except Exception as e:

            print(
                f"OCR error in {name}: {e}"
            )

    # Remove duplicate lines
    unique_lines = []

    seen = set()

    for line in all_text:

        cleaned = re.sub(
            r"\s+",
            " ",
            line
        ).strip()

        if not cleaned:
            continue

        key = cleaned.lower()

        if key not in seen:

            seen.add(key)

            unique_lines.append(
                cleaned
            )

    return "\n".join(
        unique_lines
    )