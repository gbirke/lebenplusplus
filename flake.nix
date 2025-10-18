{
  description = "A flake for building the blog with Hugo";

  inputs = {
    nixpkgs.url = "nixpkgs/nixos-24.11";
  };

  outputs =
    { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };

      theme = pkgs.fetchgit {
        url = "https://github.com/yoshiharuyamashita/blackburn.git";
        rev = "99cf136a06f37375d26bda5d6dfadd6943fe8a58";
        sha256 = "sha256-4GiONQvzIYfbox2TfzKBB2Wq0VprBYdeBNc7PgANnoo=";
      };
    in
    {
      # Default package for building the site
      packages.${system}.default = pkgs.stdenv.mkDerivation {
        name = "blog-lebenplusplus";
        src = self;
        buildInputs = [ pkgs.hugo ];
        buildPhase = ''
          mkdir -p themes/blackburn
          cp -r ${theme}/* themes/blackburn
          hugo build
        '';
        installPhase = ''
          mkdir -p $out
          cp -r public/* $out
        '';
      };

      # Formatter (for `nix fmt`)
      formatter.${system} = pkgs.nixpkgs-fmt;

      # Dev shell (for `direnv` or `nix develop`)
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [
          pkgs.hugo
          pkgs.git
          pkgs.nixfmt-rfc-style
        ];
        shellHook = ''
          echo "Hugo dev environment ready!"
        '';
      };
    };
}
