import pytest
from process import compute_diffs

def test_compute_diffs():
    original = "This is a test."
    modified = "This is a modified test."
    diffs = compute_diffs(original, modified)
    
    # Check that we get a list of differences
    assert isinstance(diffs, list)
    
    # Check that the diffs contain the expected changes
    expected_changes = [
        (0, "This is a "),  # unchanged
        (1, "modified "),   # added
        (0, "test.")       # unchanged
    ]
    
    assert len(diffs) == len(expected_changes)
    for (diff, expected) in zip(diffs, expected_changes):
        assert diff[0] == expected[0]  # Check operation type
        assert diff[1] == expected[1]  # Check text content 