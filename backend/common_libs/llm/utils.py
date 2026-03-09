import logging

from google.genai.types import GroundingMetadata

logger = logging.getLogger(__name__)


def extract_grounding_metadata_from_genai_response(response) -> GroundingMetadata | None:
    """
    Extract grounding metadata from a google-genai SDK response.
    
    Args:
        response: Response object from genai SDK's generate_content
        
    Returns:
        GroundingMetadata if found, None otherwise
    """
    if not hasattr(response, "candidates") or not response.candidates:
        return None
    
    candidate = response.candidates[0]
    if not hasattr(candidate, "grounding_metadata"):
        return None
    
    gm = candidate.grounding_metadata
    if not gm:
        return None
    
    raw_dict: dict
    if isinstance(gm, dict):
        raw_dict = gm
    elif hasattr(gm, "model_dump"):
        raw_dict = gm.model_dump()
    elif hasattr(gm, "__dict__"):
        raw_dict = gm.__dict__
    else:
        return None
    
    if not isinstance(raw_dict, dict):
        return None
    
    for key in list(raw_dict.keys()):
        if raw_dict[key] is None:
            if key in ["web_search_queries", "webSearchQueries", "grounding_chunks", "groundingChunks", "grounding_supports", "groundingSupports"]:
                raw_dict[key] = []
            else:
                del raw_dict[key]
    
    try:
        return GroundingMetadata(**raw_dict)
    except Exception as e:
        logger.debug("Failed to parse grounding metadata: %s. Raw dict: %s", e, raw_dict)
        return None