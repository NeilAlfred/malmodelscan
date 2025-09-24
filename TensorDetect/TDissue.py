from enum import Enum


class Ability(Enum):
    NONE = "None"
    WRITE = "Arbitary file write"
    READ_FILE = "Arbitary file read"
    READ_DIR = "Arbitary directory read"
    NETWORK = "Network access(leading to IP / data leakage)"
    EXEC = "Code execution"

class Issue:
    def __init__(self, severity, category, ability, details):
        """
        Initialize an Issue object with severity level, issue category, and detailed information.
        :param severity: severity level (e.g.high, mid, low)
        :param category: issue category (e.g.Tensorabuse,lambda layer)
        :param details: detailed information
        :param malicious ability: tensorabuse op's hidden ability to abuse
        """
        self.severity = severity
        self.category = category
        self.details = details
        self.ability = ability

    def __str__(self):
        """
        Return a formatted string representation of the issue.
        """
        return f"Issue: [\n\t Severity: {self.severity.value}\n\t Category: {self.category.value}\n\t Malicious ability (probable): {self.ability.value}\n\t Details: {self.details}]\n"

class Severity(Enum):
    HIGH = "high"
    MID = "mid"
    LOW = "low"
        
class Category(Enum):
    TENSOR_ABUSE = "Tensor abuse"
    LAMBDA_LAYER = "lambda layer"


