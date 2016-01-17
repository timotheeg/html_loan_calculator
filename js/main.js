
// get params
function getParams()
{
	var params = {
		initial_amount: parseInt($('#initial_amount').val(), 10) || 0,
		interest_rate_per_annum: parseFloat($('#interest_rate_per_annum').val()) / 100 || 0,
		monthly_amount: parseFloat($('#monthly_amount').val()),
		num_months: parseInt($('#num_months').val(), 10)
	};

	params.method = $('#by_monthly_amount').is(':checked')
		? 'by_monthly_amount'
		: 'by_num_months';

	return params;
}

function updateUI()
{
	var params = getParams();
	var data = computeLoanData(params);
	updatePaymentTable(data);

	console.log(data);
}

function computeLoanData(params) {
	var
		total_paid = 0,
		num_months = 0,
		remainder = Math.floor(params.initial_amount * 100),
		monthly_interest_rate = params.interest_rate_per_annum / 12,
		monthly_amount,
		months = [];

	if (params.method == 'by_num_months') {
		var pow = Math.pow(1 + monthly_interest_rate, params.num_months);
		monthly_amount = remainder * monthly_interest_rate * pow / (pow - 1);
	}
	else {
		monthly_amount = params.monthly_amount * 100;
	}

	monthly_amount = Math.ceil(monthly_amount);

	// compute by amount first
	while (remainder > 0)
	{
		var interest = Math.floor(remainder * monthly_interest_rate);
		remainder += interest;

		var to_pay = remainder > monthly_amount ? monthly_amount : remainder;

		total_paid += to_pay;
		remainder -= to_pay;

		months.push({
			interest: interest / 100,
			repayment: to_pay / 100,
			remainder: remainder / 100
		});
	}

	$('#monthly_amount').val((monthly_amount / 100).toFixed(2));
	$('#num_months').val(months.length);

	return {
		total_paid: total_paid / 100,
		interest_paid: (total_paid - params.initial_amount * 100) / 100,
		months: months
	};
}

function updatePaymentTable(data) {
	$('#total_repayment').text(data.total_paid.toFixed(2));
	$('#total_interested_paid').text(data.interest_paid.toFixed(2));

	var rows = $('#monthly_breakdown').empty();

	for (var idx=0; idx < data.months.length; idx++) {
		var month_num = idx+1;
		var is_new_year = (idx % 12) === 0;
		var tr = $('<tr />')
			.append($('<td />').text(month_num))
			.append($('<td />').text(data.months[idx].interest.toFixed(2)))
			.append($('<td />').text(data.months[idx].repayment.toFixed(2)))
			.append($('<td />').text(data.months[idx].remainder.toFixed(2)))
			.addClass(is_new_year ? 'jan' : '')
			.appendTo(rows);
	}
}

// initiatilize listeners
$('#initial_amount').on('change', updateUI);
$('#interest_rate_per_annum').on('change', updateUI);
$('#monthly_amount').on('change', updateUI);
$('#num_months').on('change', updateUI);
$('#by_monthly_amount').on('change', updateUI);
$('#by_num_months').on('change', updateUI);
