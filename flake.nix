{
  description = "A flake for building the blog with Hugo";

  inputs.nixpkgs.url = "nixpkgs/nixos-24.11";

  outputs = { self, nixpkgs }: {

    defaultPackage.x86_64-linux =
	  let
      	pkgs = import nixpkgs { system = "x86_64-linux"; };

		theme = pkgs.fetchgit {
          url = "https://github.com/yoshiharuyamashita/blackburn.git";
          rev = "99cf136a06f37375d26bda5d6dfadd6943fe8a58"; 
          sha256 = "sha256-4GiONQvzIYfbox2TfzKBB2Wq0VprBYdeBNc7PgANnoo=";
        };
	  in

      pkgs.stdenv.mkDerivation {
        name = "blog-lebenplusplus";
        src = self;
		buildInputs = [ pkgs.hugo ];
        buildPhase = "mkdir -p themes/blackburn; cp -r ${theme}/* themes/blackburn; hugo build";
        installPhase = ''
			mkdir -p $out; cp -r public/* $out;
		'';
      };

  };
}
