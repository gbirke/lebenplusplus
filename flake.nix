{
  description = "A flake for building documents from source";

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

      # Notice the reference to nixpkgs here.
      pkgs.stdenv.mkDerivation {
        name = "blog-lebenplusplus";
        src = self;
		buildInputs = [ pkgs.hugo ];
        buildPhase = "mkdir -p themes/blackburn; cp -r ${theme}/* themes/blackburn; hugo build";
		# This will copy the generated HTML file to the output directory in share/doc/my-docs
        installPhase = ''
			mkdir -p $out; cp -r public/* $out;
		'';
      };

  };
}
