import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';

@Component({
	selector: 'app-root',
	template: `
		<div style="font-family: Inter, system-ui, sans-serif; padding: 20px">
			<h1>IT Microfrontend</h1>
			<p>Track IT tickets, device policies, and knowledge base.</p>
		</div>
	`
})
class AppComponent {}

bootstrapApplication(AppComponent).catch(err => console.error(err)); 