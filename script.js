// Fonction pour analyser les logs
function parseLogs(logs) {
    const lines = logs.split('\n').filter(line => line.trim() !== '');
    const actions = [];
    const regex = /^(\d+)\s+(\d+)\s+.*?\b(eating|thinking|sleeping|.+)\b.*$/;

    const lastActions = {}; // Stocke la dernière action pour chaque philosophe

    let previousTimestamp = -1;
    for (const line of lines) {
        const match = line.match(regex);
        if (!match) {
            throw new Error(`Log mal formaté : "${line}"`);
        }

        const timestamp = parseInt(match[1]);
        const philosopher = parseInt(match[2]);
        const action = match[3];

        // Validation de l'ordre croissant des timestamps
        if (timestamp < previousTimestamp) {
            throw new Error("Les timestamps ne sont pas par ordre croissant.");
        }
        previousTimestamp = timestamp;

        // Créer une nouvelle action
        if (lastActions[philosopher]) {
            // Si une action précédente existe, on la termine ici
            lastActions[philosopher].end = timestamp;
            actions.push(lastActions[philosopher]);
        }

        // Nouvelle action pour le philosophe
        lastActions[philosopher] = {
            start: timestamp,
            end: null, // L'action est encore en cours
            philosopher,
            action,
        };
    }

    // Ajouter toutes les actions restantes
    for (const key in lastActions) {
        if (lastActions[key].end === null) {
            lastActions[key].end = previousTimestamp; // Clôturer les actions ouvertes
            actions.push(lastActions[key]);
        }
    }

    return actions;
}


function findMinTimestamp(actions) {
    return Math.min(...actions.map(action => action.start));
}

function generateGantt(actions) {
    const container = document.getElementById('gantt-container');
    container.innerHTML = '';

    const philosophers = [...new Set(actions.map(action => action.philosopher))].sort((a, b) => a - b);

    const minTimestamp = Math.min(...actions.map(action => action.start));
    const maxTimestamp = Math.max(...actions.map(action => action.end));
    const totalDuration = maxTimestamp - minTimestamp;

    philosophers.forEach(philosopher => {
        const row = document.createElement('div');
        row.classList.add('philosopher-row');

        const label = document.createElement('div');
        label.classList.add('philosopher-label');
        label.textContent = `Philosophe ${philosopher}`;
        row.appendChild(label);

        const actionsForPhilosopher = actions
            .filter(action => action.philosopher === philosopher)
            .sort((a, b) => a.start - b.start);

        actionsForPhilosopher.forEach(action => {
            const bar = document.createElement('div');
            bar.classList.add('bar');

            const duration = action.end - action.start;
            const offset = action.start - minTimestamp;

            bar.style.width = `${(duration / totalDuration) * 100}%`;
            bar.style.left = `${(offset / totalDuration) * 100}%`;

            // Appliquer une largeur maximale pour les barres longues
            bar.style.maxWidth = '100%'; // Limite de largeur
            bar.style.width = Math.min(parseFloat(bar.style.width), 100) + '%'; // Appliquer le maximum

            // Couleur de la barre en fonction de l'action
            if (action.action.includes('eating')) {
                bar.classList.add('eating');
            } else if (action.action.includes('thinking')) {
                bar.classList.add('thinking');
            } else if (action.action.includes('sleeping')) {
                bar.classList.add('sleeping');
            } else {
                bar.classList.add('unknown');
            }

			// Afficher l'action sur la barre si la largeur est suffisante
            if (parseFloat(bar.style.width) > 5) { // Vérifier si la largeur est supérieure à 5%
                const actionText = document.createElement('span');
                actionText.textContent = action.action;
                bar.appendChild(actionText);
            }

            // Tooltip avec la date de début et de fin et l'action
            bar.title = `Action: ${action.action}\nDébut: ${action.start}\nFin: ${action.end}`;
            row.appendChild(bar);
        });

        container.appendChild(row);
    });
}

// Gestionnaire d'événement pour le bouton
document.getElementById('generate-button').addEventListener('click', () => {
	const logs = document.getElementById('logs-input').value;

	try {
		const actions = parseLogs(logs);

		if (actions.length === 0) {
			alert('Aucune action valide trouvée dans les logs.');
			return;
		}

		generateGantt(actions);
	} catch (error) {
		alert(error.message);
	}
});
