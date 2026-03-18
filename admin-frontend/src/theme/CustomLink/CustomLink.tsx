import { Link, styled, LinkProps } from "@mui/material";

interface CustomLinkProps extends LinkProps {
  disabled?: boolean;
}

const StyledLink = styled(Link)<CustomLinkProps>(({ theme, disabled }) => ({
  color: disabled ? theme.palette.text.disabled : theme.palette.text.primary,
  opacity: disabled ? 0.5 : 1,
  cursor: disabled ? "not-allowed" : "pointer",
  textDecoration: "underline",
  pointerEvents: disabled ? "none" : "auto",
  fontWeight: disabled ? "normal" : "bold",
  whiteSpace: "nowrap",
  "&:hover": {
    color: disabled ? theme.palette.text.textAccent : theme.palette.grey["500"],
  },
}));

const CustomLink = (props: CustomLinkProps) => {
  const isDisabled = Boolean(props.disabled);
  return <StyledLink {...props} disabled={isDisabled} aria-disabled={isDisabled} />;
};

export default CustomLink;
