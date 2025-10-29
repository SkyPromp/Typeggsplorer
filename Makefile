build:
	ng build --configuration production --output-path docs --base-href /Typeggsplorer/ --delete-output-path
	cd docs && mv browser/* . && rmdir browser

run:
	ng serve
