 #push command
git status               # Check the status of your files
git add .                # Stage all changes
git commit -m "Your message"  # Commit the changes
git push origin main     # Push to main branch

#unlink command
Remove-Item -Recurse -Force .git # Unlink the Old Repository

#new repo set up 
git init
git remote add origin <your-new-repo-URL>
git add .
git commit -m "Initial commit "
git branch -M main
git push -u origin main